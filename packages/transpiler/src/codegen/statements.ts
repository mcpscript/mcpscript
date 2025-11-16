// Statement code generators for MCP Script
import {
  Statement,
  Assignment,
  AssignmentTarget,
  ExpressionStatement,
  BlockStatement,
  IfStatement,
  WhileStatement,
  ForStatement,
  BreakStatement,
  ContinueStatement,
  Comment,
  Identifier,
  MemberExpression,
  BracketExpression,
} from '../ast.js';
import {
  generateExpression,
  generateMemberExpression,
  generateBracketExpression,
} from './expressions.js';

/**
 * Scope stack for tracking variable declarations across nested scopes
 * Uses inheritance-based scoping: each new scope inherits variables from its parent
 */
export class ScopeStack {
  private scopes: Set<string>[] = [new Set()]; // Start with global scope

  /**
   * Push a new scope (for blocks, functions, etc.)
   * New scope inherits all variables from its parent scope
   */
  pushScope(): void {
    const parentScope = this.scopes[this.scopes.length - 1];
    const newScope = new Set(parentScope); // Inherit all parent variables
    this.scopes.push(newScope);
  }

  /**
   * Pop the current scope
   */
  popScope(): void {
    if (this.scopes.length <= 1) {
      throw new Error('Cannot pop global scope');
    }
    this.scopes.pop();
  }

  /**
   * Check if a variable has been declared in the current scope (including inherited)
   * This implements inheritance-based scoping: variables declared in ancestor scopes are available
   */
  isDeclared(variable: string): boolean {
    const currentScope = this.scopes[this.scopes.length - 1];
    return currentScope.has(variable);
  }

  /**
   * Declare a variable in the current scope
   */
  declare(variable: string): void {
    const currentScope = this.scopes[this.scopes.length - 1];
    currentScope.add(variable);
  }

  /**
   * Get current scope depth (for debugging)
   */
  get depth(): number {
    return this.scopes.length;
  }
}

/**
 * Central statement dispatcher - handles all statement types in one place
 */
export function dispatchStatement(
  stmt: Statement,
  scopeStack: ScopeStack
): string {
  switch (stmt.type) {
    case 'comment':
      return generateComment(stmt);
    case 'assignment':
      return generateAssignment(stmt, scopeStack);
    case 'expression_statement':
      return generateExpressionStatement(stmt);
    case 'block_statement':
      return generateBlockStatement(stmt, scopeStack);
    case 'if_statement':
      return generateIfStatement(stmt, scopeStack);
    case 'while_statement':
      return generateWhileStatement(stmt, scopeStack);
    case 'for_statement':
      return generateForStatement(stmt, scopeStack);
    case 'break_statement':
      return generateBreakStatement(stmt);
    case 'continue_statement':
      return generateContinueStatement(stmt);
    default:
      return '';
  }
}

/**
 * Generate code for an assignment statement
 */
function generateAssignment(stmt: Assignment, scopeStack: ScopeStack): string {
  const value = generateExpression(stmt.value);

  // Handle different assignment target types
  if (stmt.target.type === 'identifier') {
    const identifier = stmt.target as Identifier;
    const variable = identifier.name;

    // Check if this is the first time we're seeing this variable
    if (scopeStack.isDeclared(variable)) {
      // Variable already declared, generate reassignment
      return `${variable} = ${value};`;
    } else {
      // First time seeing this variable, generate declaration
      scopeStack.declare(variable);
      return `let ${variable} = ${value};`;
    }
  } else {
    // For member and bracket expressions, generate direct assignment
    const target = generateAssignmentTarget(stmt.target);
    return `${target} = ${value};`;
  }
}

/**
 * Generate code for an assignment target
 */
function generateAssignmentTarget(target: AssignmentTarget): string {
  switch (target.type) {
    case 'identifier':
      return (target as Identifier).name;
    case 'member':
      return generateMemberExpression(target as MemberExpression);
    case 'bracket':
      return generateBracketExpression(target as BracketExpression);
    default:
      throw new Error(
        `Unknown assignment target type: ${(target as AssignmentTarget).type}`
      );
  }
}

/**
 * Generate code for an expression statement
 */
function generateExpressionStatement(stmt: ExpressionStatement): string {
  const expr = generateExpression(stmt.expression);
  // Expression already includes await if needed
  return `${expr};`;
}

/**
 * Generate code for a block statement
 */
export function generateBlockStatement(
  stmt: BlockStatement,
  scopeStack: ScopeStack,
  createNewScope: boolean = true
): string {
  // Only push a new scope if requested (control flow blocks don't create new scopes)
  if (createNewScope) {
    scopeStack.pushScope();
  }

  try {
    const blockLines = stmt.statements
      .filter(
        s => s.type !== 'mcp_declaration' && s.type !== 'agent_declaration'
      )
      .map(s => dispatchStatement(s, scopeStack))
      .filter(Boolean);

    if (blockLines.length === 0) {
      return '{}';
    }

    const indentedLines = blockLines
      .map(line =>
        // If line is already a block, indent each of its lines
        line.includes('\n')
          ? line
              .split('\n')
              .map(subLine => `  ${subLine}`)
              .join('\n')
          : `  ${line}`
      )
      .join('\n');

    return `{\n${indentedLines}\n}`;
  } finally {
    // Only pop the scope if we created one
    if (createNewScope) {
      scopeStack.popScope();
    }
  }
}

/**
 * Generate code for an if statement
 */
function generateIfStatement(
  stmt: IfStatement,
  scopeStack: ScopeStack
): string {
  const condition = generateExpression(stmt.condition);

  // Always normalize statements to block format for consistency
  const thenCode = generateStatementAsBlock(stmt.then, scopeStack);

  if (stmt.else) {
    const elseCode = generateStatementAsBlock(stmt.else, scopeStack);
    return `if (${condition}) ${thenCode} else ${elseCode}`;
  } else {
    return `if (${condition}) ${thenCode}`;
  }
}

/**
 * Generate code for a while statement
 */
function generateWhileStatement(
  stmt: WhileStatement,
  scopeStack: ScopeStack
): string {
  const condition = generateExpression(stmt.condition);

  // Always normalize statements to block format for consistency
  const bodyCode = generateStatementAsBlock(stmt.body, scopeStack);

  return `while (${condition}) ${bodyCode}`;
}

/**
 * Generate code for a for statement
 */
function generateForStatement(
  stmt: ForStatement,
  scopeStack: ScopeStack
): string {
  const init = stmt.init
    ? generateAssignment(stmt.init, scopeStack).replace(/;$/, '')
    : '';
  const condition = stmt.condition ? generateExpression(stmt.condition) : '';
  const update = stmt.update
    ? generateAssignmentForUpdate(stmt.update, scopeStack)
    : '';

  // Always normalize statements to block format for consistency
  const bodyCode = generateStatementAsBlock(stmt.body, scopeStack);

  // Handle special case where all parts are empty to match expected format
  if (!init && !condition && !update) {
    return `for (;;) ${bodyCode}`;
  }

  return `for (${init}; ${condition}; ${update}) ${bodyCode}`;
}

/**
 * Generate code for a break statement
 */
function generateBreakStatement(_stmt: BreakStatement): string {
  return 'break;';
}

/**
 * Generate code for a continue statement
 */
function generateContinueStatement(_stmt: ContinueStatement): string {
  return 'continue;';
}

/**
 * Generate code for a comment
 */
function generateComment(stmt: Comment): string {
  return stmt.text;
}

/**
 * Generate assignment code for for loop update (without semicolon and let/const)
 */
function generateAssignmentForUpdate(
  stmt: Assignment,
  _scopeStack: ScopeStack
): string {
  const value = generateExpression(stmt.value);

  // Handle different assignment target types
  if (stmt.target.type === 'identifier') {
    const identifier = stmt.target as Identifier;
    const variable = identifier.name;

    // In update expressions, we never use 'let' - variable should already be declared in init
    return `${variable} = ${value}`;
  } else {
    // For member and bracket expressions, generate direct assignment
    const target = generateAssignmentTarget(stmt.target);
    return `${target} = ${value}`;
  }
}

/**
 * Generate a statement as a block, wrapping non-block statements
 */
function generateStatementAsBlock(
  stmt: Statement,
  scopeStack: ScopeStack
): string {
  if (stmt.type === 'block_statement') {
    // All explicit block statements create new scopes (JavaScript behavior)
    return generateBlockStatement(stmt, scopeStack, true);
  } else {
    // Wrap non-block statements in synthetic blocks with proper indentation
    // These synthetic blocks DON'T create new scopes - only explicit {} blocks do
    const statementCode = generateSingleStatement(stmt, scopeStack);
    const indentedCode = indentCode(statementCode, '  ');
    return `{\n${indentedCode}\n}`;
  }
}

/**
 * Indent code by adding the given prefix to each line
 */
function indentCode(code: string, indent: string): string {
  return code
    .split('\n')
    .map(line => (line.trim() ? `${indent}${line}` : line))
    .join('\n');
}

/**
 * Generate code for a single statement (non-block)
 */
function generateSingleStatement(
  stmt: Statement,
  scopeStack: ScopeStack
): string {
  return dispatchStatement(stmt, scopeStack);
}
