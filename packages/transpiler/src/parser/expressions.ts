// Expression parsers for MCP Script
import Parser from 'tree-sitter';
import {
  Expression,
  Identifier,
  StringLiteral,
  NumberLiteral,
  BooleanLiteral,
  ArrayLiteral,
  ObjectLiteral,
  Property,
  CallExpression,
  MemberExpression,
  BracketExpression,
  BinaryExpression,
  UnaryExpression,
} from '../ast.js';

/**
 * Parse an expression node
 */
export function parseExpression(node: Parser.SyntaxNode): Expression {
  // Handle wrapper nodes
  if (node.type === 'expression') {
    const child = node.firstChild;
    if (child) {
      return parseExpression(child);
    }
  }

  switch (node.type) {
    case 'identifier':
      return parseIdentifier(node);
    case 'literal':
      return parseLiteral(node);
    case 'call_expression':
      return parseCallExpression(node);
    case 'member_expression':
      return parseMemberExpression(node);
    case 'bracket_expression':
      return parseBracketExpression(node);
    case 'binary_expression':
      return parseBinaryExpression(node);
    case 'unary_expression':
      return parseUnaryExpression(node);
    case 'parenthesized_expression':
      return parseParenthesizedExpression(node);
    case 'string':
      return parseStringLiteral(node);
    case 'number':
      return parseNumber(node);
    case 'boolean':
      return parseBoolean(node);
    case 'array_literal':
      return parseArrayLiteral(node);
    case 'object_literal':
      return parseObjectLiteral(node);
    default:
      throw new Error(`Unknown expression type: ${node.type}`);
  }
}

/**
 * Parse an identifier
 */
export function parseIdentifier(node: Parser.SyntaxNode): Identifier {
  return {
    type: 'identifier',
    name: node.text,
  };
}

/**
 * Parse a literal node
 */
function parseLiteral(node: Parser.SyntaxNode): Expression {
  const child = node.firstChild;
  if (!child) {
    throw new Error('Invalid literal: no child node');
  }
  return parseExpression(child);
}

/**
 * Parse a string literal
 */
function parseStringLiteral(node: Parser.SyntaxNode): StringLiteral {
  // Parse string by removing quotes and processing escape sequences
  let text = node.text;

  // Remove surrounding quotes
  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'"))
  ) {
    text = text.slice(1, -1);
  }

  // Process escape sequences
  text = text
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\\\/g, '\\')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'");

  return {
    type: 'string',
    value: text,
  };
}

/**
 * Parse a number literal
 */
function parseNumber(node: Parser.SyntaxNode): NumberLiteral {
  return {
    type: 'number',
    value: parseFloat(node.text),
  };
}

/**
 * Parse a boolean literal
 */
function parseBoolean(node: Parser.SyntaxNode): BooleanLiteral {
  return {
    type: 'boolean',
    value: node.text === 'true',
  };
}

/**
 * Parse an array literal
 */
function parseArrayLiteral(node: Parser.SyntaxNode): ArrayLiteral {
  const elements: Expression[] = [];

  for (const child of node.children) {
    if (child.type === 'expression') {
      elements.push(parseExpression(child));
    }
  }

  return {
    type: 'array',
    elements,
  };
}

/**
 * Parse an object literal
 */
function parseObjectLiteral(node: Parser.SyntaxNode): ObjectLiteral {
  const properties: Property[] = [];

  // Find property_list
  const propertyList = node.children.find(c => c.type === 'property_list');
  if (propertyList) {
    for (const child of propertyList.children) {
      if (child.type === 'property') {
        properties.push(parseProperty(child));
      }
    }
  }

  return {
    type: 'object',
    properties,
  };
}

/**
 * Parse an object property
 */
function parseProperty(node: Parser.SyntaxNode): Property {
  const keyNode = node.children.find(c => c.type === 'identifier');
  const valueNode = node.children.find(c => c.type === 'expression');

  if (!keyNode || !valueNode) {
    throw new Error('Invalid property: missing key or value');
  }

  return {
    type: 'property',
    key: keyNode.text,
    value: parseExpression(valueNode),
  };
}

/**
 * Parse a call expression
 */
function parseCallExpression(node: Parser.SyntaxNode): CallExpression {
  // <expression> ( <argument_list> )
  const calleeNode = node.children.find(c => c.type === 'expression');
  const argumentListNode = node.children.find(c => c.type === 'argument_list');

  if (!calleeNode) {
    throw new Error('Invalid call_expression: missing callee');
  }

  const callee = parseExpression(calleeNode);
  const args: Expression[] = [];

  if (argumentListNode) {
    for (const child of argumentListNode.children) {
      if (child.type === 'expression') {
        args.push(parseExpression(child));
      }
    }
  }

  return {
    type: 'call',
    callee,
    arguments: args,
  };
}

/**
 * Parse a member expression
 */
export function parseMemberExpression(
  node: Parser.SyntaxNode
): MemberExpression {
  // <expression> . <identifier>
  const objectNode = node.children.find(c => c.type === 'expression');
  const propertyNode = node.children.find(c => c.type === 'identifier');

  if (!objectNode || !propertyNode) {
    throw new Error('Invalid member_expression: missing object or property');
  }

  const object = parseExpression(objectNode);
  const property = propertyNode.text;

  return {
    type: 'member',
    object,
    property,
  };
}

/**
 * Parse a bracket expression (array/object indexing)
 */
export function parseBracketExpression(
  node: Parser.SyntaxNode
): BracketExpression {
  // <expression> [ <expression> ]
  const expressionNodes = node.children.filter(c => c.type === 'expression');

  if (expressionNodes.length !== 2) {
    throw new Error('Invalid bracket_expression: missing object or index');
  }

  const object = parseExpression(expressionNodes[0]);
  const index = parseExpression(expressionNodes[1]);

  return {
    type: 'bracket',
    object,
    index,
  };
}

/**
 * Parse a parenthesized expression
 */
function parseParenthesizedExpression(node: Parser.SyntaxNode): Expression {
  const expressionNode = node.children.find(c => c.type === 'expression');
  if (!expressionNode) {
    throw new Error('Invalid parenthesized_expression: missing expression');
  }
  return parseExpression(expressionNode);
}

/**
 * Parse a binary expression
 */
function parseBinaryExpression(node: Parser.SyntaxNode): BinaryExpression {
  const children = node.children;
  const expressionNodes = children.filter(c => c.type === 'expression');
  const operatorNode = children.find(
    c =>
      c.type === '+' ||
      c.type === '-' ||
      c.type === '*' ||
      c.type === '/' ||
      c.type === '%' ||
      c.type === '==' ||
      c.type === '!=' ||
      c.type === '<' ||
      c.type === '>' ||
      c.type === '<=' ||
      c.type === '>=' ||
      c.type === '&&' ||
      c.type === '||' ||
      c.type === '??' ||
      c.type === '->'
  );

  if (expressionNodes.length !== 2 || !operatorNode) {
    throw new Error('Invalid binary_expression: missing operands or operator');
  }

  const left = parseExpression(expressionNodes[0]);
  const right = parseExpression(expressionNodes[1]);
  const operator = operatorNode.type as
    | '+'
    | '-'
    | '*'
    | '/'
    | '%'
    | '=='
    | '!='
    | '<'
    | '>'
    | '<='
    | '>='
    | '&&'
    | '||'
    | '??'
    | '->';

  return {
    type: 'binary',
    left,
    operator,
    right,
  };
}

/**
 * Parse a unary expression
 */
function parseUnaryExpression(node: Parser.SyntaxNode): UnaryExpression {
  const children = node.children;
  const operatorNode = children.find(c => c.type === '!' || c.type === '-');
  const expressionNode = children.find(c => c.type === 'expression');

  if (!operatorNode || !expressionNode) {
    throw new Error('Invalid unary_expression: missing operator or operand');
  }

  const operator = operatorNode.type as '!' | '-';
  const operand = parseExpression(expressionNode);

  return {
    type: 'unary',
    operator,
    operand,
  };
}
