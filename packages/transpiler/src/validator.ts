// Variable validation for MCP Script
import {
  Statement,
  Expression,
  Identifier,
  CallExpression,
  MemberExpression,
  BracketExpression,
  BinaryExpression,
  UnaryExpression,
  ArrayLiteral,
  ObjectLiteral,
  Assignment,
  ExpressionStatement,
  BlockStatement,
  IfStatement,
  WhileStatement,
  ForStatement,
  ReturnStatement,
  MCPDeclaration,
  ModelDeclaration,
  AgentDeclaration,
  ToolDeclaration,
} from './ast.js';

/**
 * List of allowed global variables in MCP Script
 * These are provided by the runtime and don't need to be declared
 */
const ALLOWED_GLOBALS = new Set([
  // Logging
  'log',
  'print',

  // Environment
  'env',

  // Collections
  'Set',
  'Map',

  // Data utilities
  'JSON',

  // Special values
  'null',
  'undefined',

  // JavaScript built-ins that are safe to expose
  'Math',
  'Date',
  'Object',
  'Array',
  'String',
  'Number',
  'Boolean',
  'RegExp',
  'parseInt',
  'parseFloat',
  'isNaN',
  'isFinite',
  'encodeURIComponent',
  'decodeURIComponent',
  'encodeURI',
  'decodeURI',
]);

/**
 * Validation error for undefined variables
 */
export class UndefinedVariableError extends Error {
  constructor(
    public readonly variable: string,
    public readonly context: string = ''
  ) {
    super(
      `Undefined variable: '${variable}'${context ? ` in ${context}` : ''}`
    );
    this.name = 'UndefinedVariableError';
  }
}

/**
 * Scope tracker for variable validation
 * Tracks both declared variables and allowed globals
 */
class ValidationScope {
  private scopes: Set<string>[] = [new Set(ALLOWED_GLOBALS)];

  /**
   * Push a new scope
   */
  pushScope(): void {
    const parentScope = this.scopes[this.scopes.length - 1];
    const newScope = new Set(parentScope);
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
   * Check if a variable is defined (either declared or a global)
   */
  isDefined(variable: string): boolean {
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
}

/**
 * Validate all statements in a program
 * Throws UndefinedVariableError if any undefined variables are referenced
 */
export function validateStatements(statements: Statement[]): void {
  const scope = new ValidationScope();

  // First pass: collect all top-level declarations (MCP servers, models, agents, tools)
  for (const stmt of statements) {
    if (stmt.type === 'mcp_declaration') {
      scope.declare((stmt as MCPDeclaration).name);
    } else if (stmt.type === 'model_declaration') {
      scope.declare((stmt as ModelDeclaration).name);
    } else if (stmt.type === 'agent_declaration') {
      scope.declare((stmt as AgentDeclaration).name);
    } else if (stmt.type === 'tool_declaration') {
      scope.declare((stmt as ToolDeclaration).name);
    }
  }

  // Second pass: validate all statements
  for (const stmt of statements) {
    validateStatement(stmt, scope);
  }
}

/**
 * Validate a single statement
 */
function validateStatement(stmt: Statement, scope: ValidationScope): void {
  switch (stmt.type) {
    case 'mcp_declaration':
    case 'model_declaration':
    case 'agent_declaration':
      // These are validated in the first pass
      validateDeclarationConfig(stmt, scope);
      break;
    case 'tool_declaration':
      validateToolDeclaration(stmt as ToolDeclaration, scope);
      break;
    case 'assignment':
      validateAssignment(stmt as Assignment, scope);
      break;
    case 'expression_statement':
      validateExpression((stmt as ExpressionStatement).expression, scope);
      break;
    case 'block_statement':
      validateBlockStatement(stmt as BlockStatement, scope);
      break;
    case 'if_statement':
      validateIfStatement(stmt as IfStatement, scope);
      break;
    case 'while_statement':
      validateWhileStatement(stmt as WhileStatement, scope);
      break;
    case 'for_statement':
      validateForStatement(stmt as ForStatement, scope);
      break;
    case 'return_statement':
      validateReturnStatement(stmt as ReturnStatement, scope);
      break;
    case 'break_statement':
    case 'continue_statement':
    case 'comment':
      // No variables to validate
      break;
    default:
      // Unknown statement type - skip validation
      break;
  }
}

/**
 * Validate declaration configuration (MCP, model, agent)
 */
function validateDeclarationConfig(
  stmt: MCPDeclaration | ModelDeclaration | AgentDeclaration,
  scope: ValidationScope
): void {
  if (stmt.type === 'mcp_declaration') {
    validateExpression((stmt as MCPDeclaration).config, scope);
  } else if (stmt.type === 'model_declaration') {
    validateExpression((stmt as ModelDeclaration).config, scope);
  } else if (stmt.type === 'agent_declaration') {
    validateExpression((stmt as AgentDeclaration).config, scope);
  }
}

/**
 * Validate a tool declaration
 */
function validateToolDeclaration(
  stmt: ToolDeclaration,
  scope: ValidationScope
): void {
  // Create a new scope for the tool body
  scope.pushScope();
  try {
    // Declare all parameters in the tool's scope
    for (const param of stmt.parameters) {
      scope.declare(param);
    }

    // Validate the tool body
    for (const s of stmt.body.statements) {
      validateStatement(s, scope);
    }
  } finally {
    scope.popScope();
  }
}

/**
 * Validate a return statement
 */
function validateReturnStatement(
  stmt: ReturnStatement,
  scope: ValidationScope
): void {
  if (stmt.value) {
    validateExpression(stmt.value, scope);
  }
}

/**
 * Validate an assignment statement
 */
function validateAssignment(stmt: Assignment, scope: ValidationScope): void {
  // Validate the value expression
  validateExpression(stmt.value, scope);

  // If target is an identifier, declare it (or verify it exists for member/bracket)
  if (stmt.target.type === 'identifier') {
    const variable = (stmt.target as Identifier).name;
    // Declare the variable in the current scope
    scope.declare(variable);
  } else if (stmt.target.type === 'member') {
    // Validate the object part of member expression
    validateExpression((stmt.target as MemberExpression).object, scope);
  } else if (stmt.target.type === 'bracket') {
    // Validate both object and index
    const bracket = stmt.target as BracketExpression;
    validateExpression(bracket.object, scope);
    validateExpression(bracket.index, scope);
  }
}

/**
 * Validate a block statement
 */
function validateBlockStatement(
  stmt: BlockStatement,
  scope: ValidationScope
): void {
  scope.pushScope();
  try {
    for (const s of stmt.statements) {
      validateStatement(s, scope);
    }
  } finally {
    scope.popScope();
  }
}

/**
 * Validate an if statement
 */
function validateIfStatement(stmt: IfStatement, scope: ValidationScope): void {
  validateExpression(stmt.condition, scope);

  // Create separate scopes for then/else branches if they're not explicit blocks
  if (stmt.then.type === 'block_statement') {
    validateStatement(stmt.then, scope);
  } else {
    scope.pushScope();
    try {
      validateStatement(stmt.then, scope);
    } finally {
      scope.popScope();
    }
  }

  if (stmt.else) {
    if (stmt.else.type === 'block_statement') {
      validateStatement(stmt.else, scope);
    } else {
      scope.pushScope();
      try {
        validateStatement(stmt.else, scope);
      } finally {
        scope.popScope();
      }
    }
  }
}

/**
 * Validate a while statement
 */
function validateWhileStatement(
  stmt: WhileStatement,
  scope: ValidationScope
): void {
  validateExpression(stmt.condition, scope);

  // Create scope for body if not an explicit block
  if (stmt.body.type === 'block_statement') {
    validateStatement(stmt.body, scope);
  } else {
    scope.pushScope();
    try {
      validateStatement(stmt.body, scope);
    } finally {
      scope.popScope();
    }
  }
}

/**
 * Validate a for statement
 */
function validateForStatement(
  stmt: ForStatement,
  scope: ValidationScope
): void {
  // For loop creates its own scope
  scope.pushScope();
  try {
    if (stmt.init) {
      validateAssignment(stmt.init, scope);
    }
    if (stmt.condition) {
      validateExpression(stmt.condition, scope);
    }
    if (stmt.update) {
      validateAssignment(stmt.update, scope);
    }

    // Body scope handling
    if (stmt.body.type === 'block_statement') {
      validateStatement(stmt.body, scope);
    } else {
      validateStatement(stmt.body, scope);
    }
  } finally {
    scope.popScope();
  }
}

/**
 * Validate an expression
 */
function validateExpression(expr: Expression, scope: ValidationScope): void {
  switch (expr.type) {
    case 'identifier':
      validateIdentifier(expr as Identifier, scope);
      break;
    case 'string':
    case 'number':
    case 'boolean':
      // Literals don't reference variables
      break;
    case 'array':
      validateArrayLiteral(expr as ArrayLiteral, scope);
      break;
    case 'object':
      validateObjectLiteral(expr as ObjectLiteral, scope);
      break;
    case 'call':
      validateCallExpression(expr as CallExpression, scope);
      break;
    case 'member':
      validateMemberExpression(expr as MemberExpression, scope);
      break;
    case 'bracket':
      validateBracketExpression(expr as BracketExpression, scope);
      break;
    case 'binary':
      validateBinaryExpression(expr as BinaryExpression, scope);
      break;
    case 'unary':
      validateUnaryExpression(expr as UnaryExpression, scope);
      break;
    default:
      // Unknown expression type - skip validation
      break;
  }
}

/**
 * Validate an identifier reference
 */
function validateIdentifier(expr: Identifier, scope: ValidationScope): void {
  if (!scope.isDefined(expr.name)) {
    throw new UndefinedVariableError(expr.name);
  }
}

/**
 * Validate an array literal
 */
function validateArrayLiteral(
  expr: ArrayLiteral,
  scope: ValidationScope
): void {
  for (const element of expr.elements) {
    validateExpression(element, scope);
  }
}

/**
 * Validate an object literal
 */
function validateObjectLiteral(
  expr: ObjectLiteral,
  scope: ValidationScope
): void {
  for (const prop of expr.properties) {
    validateExpression(prop.value, scope);
  }
}

/**
 * Validate a call expression
 */
function validateCallExpression(
  expr: CallExpression,
  scope: ValidationScope
): void {
  validateExpression(expr.callee, scope);
  for (const arg of expr.arguments) {
    validateExpression(arg, scope);
  }
}

/**
 * Validate a member expression
 */
function validateMemberExpression(
  expr: MemberExpression,
  scope: ValidationScope
): void {
  validateExpression(expr.object, scope);
  // Property name is not a variable reference, no need to validate
}

/**
 * Validate a bracket expression
 */
function validateBracketExpression(
  expr: BracketExpression,
  scope: ValidationScope
): void {
  validateExpression(expr.object, scope);
  validateExpression(expr.index, scope);
}

/**
 * Validate a binary expression
 */
function validateBinaryExpression(
  expr: BinaryExpression,
  scope: ValidationScope
): void {
  validateExpression(expr.left, scope);
  validateExpression(expr.right, scope);
}

/**
 * Validate a unary expression
 */
function validateUnaryExpression(
  expr: UnaryExpression,
  scope: ValidationScope
): void {
  validateExpression(expr.operand, scope);
}
