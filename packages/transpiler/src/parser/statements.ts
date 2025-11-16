// Statement parsers for MCP Script
import Parser from 'tree-sitter';
import {
  Statement,
  Assignment,
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
  parseExpression,
  parseIdentifier,
  parseMemberExpression,
  parseBracketExpression,
} from './expressions.js';
import {
  parseMCPDeclaration,
  parseModelDeclaration,
  parseAgentDeclaration,
} from './declarations.js';

/**
 * Parse a statement node
 */
export function parseStatement(node: Parser.SyntaxNode): Statement | null {
  const firstChild = node.firstChild;
  if (!firstChild) return null;

  switch (firstChild.type) {
    case 'comment':
      return parseComment(firstChild);
    case 'mcp_declaration':
      return parseMCPDeclaration(firstChild);
    case 'model_declaration':
      return parseModelDeclaration(firstChild);
    case 'agent_declaration':
      return parseAgentDeclaration(firstChild);
    case 'assignment':
      return parseAssignment(firstChild);
    case 'expression_statement':
      return parseExpressionStatement(firstChild);
    case 'block_statement':
      return parseBlockStatement(firstChild);
    case 'if_statement':
      return parseIfStatement(firstChild);
    case 'while_statement':
      return parseWhileStatement(firstChild);
    case 'for_statement':
      return parseForStatement(firstChild);
    case 'break_statement':
      return parseBreakStatement(firstChild);
    case 'continue_statement':
      return parseContinueStatement(firstChild);
    default:
      throw new Error(`Unknown statement type: ${firstChild.type}`);
  }
}

/**
 * Parse an assignment statement
 */
function parseAssignment(node: Parser.SyntaxNode): Assignment {
  // <assignment_target> = <expression>
  const children = node.children;
  const targetNode = children.find(c => c.type === 'assignment_target');
  const expressionNode = children.find(c => c.type === 'expression');

  if (!targetNode || !expressionNode) {
    throw new Error('Invalid assignment: missing target or expression');
  }

  const target = parseAssignmentTarget(targetNode);
  const value = parseExpression(expressionNode);

  return {
    type: 'assignment',
    target,
    value,
  };
}

/**
 * Parse an assignment target
 */
function parseAssignmentTarget(
  node: Parser.SyntaxNode
): Identifier | MemberExpression | BracketExpression {
  const child = node.firstChild;
  if (!child) {
    throw new Error('Invalid assignment_target: no child node');
  }

  switch (child.type) {
    case 'identifier':
      return parseIdentifier(child);
    case 'member_expression':
      return parseMemberExpression(child);
    case 'bracket_expression':
      return parseBracketExpression(child);
    default:
      throw new Error(`Invalid assignment_target type: ${child.type}`);
  }
}

/**
 * Parse an expression statement
 */
function parseExpressionStatement(
  node: Parser.SyntaxNode
): ExpressionStatement {
  const expressionNode = node.firstChild;
  if (!expressionNode) {
    throw new Error('Invalid expression_statement: missing expression');
  }

  const expression = parseExpression(expressionNode);

  return {
    type: 'expression_statement',
    expression,
  };
}

/**
 * Parse a block statement
 */
function parseBlockStatement(node: Parser.SyntaxNode): BlockStatement {
  const statements: Statement[] = [];

  for (const child of node.children) {
    if (child.type === 'statement') {
      const statement = parseStatement(child);
      if (statement) {
        statements.push(statement);
      }
    }
  }

  return {
    type: 'block_statement',
    statements,
  };
}

/**
 * Parse an if statement
 */
function parseIfStatement(node: Parser.SyntaxNode): IfStatement {
  // if ( expression ) statement [else statement]
  const conditionNode = node.children.find(c => c.type === 'expression');
  const statementNodes = node.children.filter(c => c.type === 'statement');

  if (!conditionNode || statementNodes.length === 0) {
    throw new Error('Invalid if_statement: missing condition or statement');
  }

  const condition = parseExpression(conditionNode);
  const then = parseStatement(statementNodes[0]);

  if (!then) {
    throw new Error('Invalid if_statement: could not parse then statement');
  }

  const result: IfStatement = {
    type: 'if_statement',
    condition,
    then,
  };

  // Check if there's an else statement
  if (statementNodes.length > 1) {
    const elseStatement = parseStatement(statementNodes[1]);
    if (elseStatement) {
      result.else = elseStatement;
    }
  }

  return result;
}

/**
 * Parse a while statement
 */
function parseWhileStatement(node: Parser.SyntaxNode): WhileStatement {
  // while ( expression ) statement
  const conditionNode = node.children.find(c => c.type === 'expression');
  const statementNode = node.children.find(c => c.type === 'statement');

  if (!conditionNode || !statementNode) {
    throw new Error('Invalid while_statement: missing condition or body');
  }

  const condition = parseExpression(conditionNode);
  const body = parseStatement(statementNode);

  if (!body) {
    throw new Error('Invalid while_statement: could not parse body statement');
  }

  return {
    type: 'while_statement',
    condition,
    body,
  };
}

/**
 * Parse a for statement
 */
function parseForStatement(node: Parser.SyntaxNode): ForStatement {
  // for ( [assignment] ; [expression] ; [assignment] ) statement
  // Need to parse in order by looking at the semicolons
  const statementNode = node.children.find(c => c.type === 'statement');

  if (!statementNode) {
    throw new Error('Invalid for_statement: missing body statement');
  }

  const body = parseStatement(statementNode);
  if (!body) {
    throw new Error('Invalid for_statement: could not parse body statement');
  }

  const result: ForStatement = {
    type: 'for_statement',
    body,
  };

  // Find semicolon positions to determine which parts exist
  const children = node.children;
  const semicolonIndices: number[] = [];

  for (let i = 0; i < children.length; i++) {
    if (children[i].type === ';') {
      semicolonIndices.push(i);
    }
  }

  if (semicolonIndices.length !== 2) {
    throw new Error('Invalid for_statement: expected exactly two semicolons');
  }

  // Find opening parenthesis
  let openParenIndex = -1;
  for (let i = 0; i < children.length; i++) {
    if (children[i].type === '(') {
      openParenIndex = i;
      break;
    }
  }

  if (openParenIndex === -1) {
    throw new Error('Invalid for_statement: missing opening parenthesis');
  }

  // Parse init part (between ( and first ;)
  for (let i = openParenIndex + 1; i < semicolonIndices[0]; i++) {
    if (children[i].type === 'assignment') {
      result.init = parseAssignment(children[i]);
      break;
    }
  }

  // Parse condition part (between first ; and second ;)
  for (let i = semicolonIndices[0] + 1; i < semicolonIndices[1]; i++) {
    if (children[i].type === 'expression') {
      result.condition = parseExpression(children[i]);
      break;
    }
  }

  // Parse update part (between second ; and ))
  for (let i = semicolonIndices[1] + 1; i < children.length; i++) {
    if (children[i].type === ')') {
      break;
    }
    if (children[i].type === 'assignment') {
      result.update = parseAssignment(children[i]);
      break;
    }
  }

  return result;
}

/**
 * Parse a break statement
 */
function parseBreakStatement(_node: Parser.SyntaxNode): BreakStatement {
  return {
    type: 'break_statement',
  };
}

/**
 * Parse a continue statement
 */
function parseContinueStatement(_node: Parser.SyntaxNode): ContinueStatement {
  return {
    type: 'continue_statement',
  };
}

/**
 * Parse a comment
 */
function parseComment(node: Parser.SyntaxNode): Comment {
  return {
    type: 'comment',
    text: node.text,
  };
}
