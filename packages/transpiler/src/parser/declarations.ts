// Declaration parsers for MCP Script
import Parser from 'tree-sitter';
import {
  MCPDeclaration,
  ModelDeclaration,
  AgentDeclaration,
  ToolDeclaration,
  ObjectLiteral,
  ToolParameter,
  TypeExpression,
  PrimitiveType,
  ArrayType,
  ObjectType,
  TypeProperty,
  UnionType,
} from '../ast.js';
import { parseExpression } from './expressions.js';
import { parseBlockStatement } from './statements.js';

/**
 * Parse an MCP server declaration
 */
export function parseMCPDeclaration(node: Parser.SyntaxNode): MCPDeclaration {
  // mcp <identifier> <object_literal>
  const children = node.children.filter(c => c.type !== 'mcp');
  const nameNode = children.find(c => c.type === 'identifier');
  const objectNode = children.find(c => c.type === 'object_literal');

  if (!nameNode || !objectNode) {
    throw new Error('Invalid mcp_declaration: missing name or config');
  }

  const name = nameNode.text;
  const config = parseExpression(objectNode) as ObjectLiteral;

  return {
    type: 'mcp_declaration',
    name,
    config,
  };
}

/**
 * Parse a model declaration
 */
export function parseModelDeclaration(
  node: Parser.SyntaxNode
): ModelDeclaration {
  // model <identifier> <object_literal>
  const children = node.children.filter(c => c.type !== 'model');
  const nameNode = children.find(c => c.type === 'identifier');
  const objectNode = children.find(c => c.type === 'object_literal');

  if (!nameNode || !objectNode) {
    throw new Error('Invalid model_declaration: missing name or config');
  }

  const name = nameNode.text;
  const config = parseExpression(objectNode) as ObjectLiteral;

  return {
    type: 'model_declaration',
    name,
    config,
  };
}

/**
 * Parse an agent declaration
 */
export function parseAgentDeclaration(
  node: Parser.SyntaxNode
): AgentDeclaration {
  // agent <identifier> <object_literal>
  const children = node.children.filter(c => c.type !== 'agent');
  const nameNode = children.find(c => c.type === 'identifier');
  const objectNode = children.find(c => c.type === 'object_literal');

  if (!nameNode || !objectNode) {
    throw new Error('Invalid agent_declaration: missing name or config');
  }

  const name = nameNode.text;
  const config = parseExpression(objectNode) as ObjectLiteral;

  return {
    type: 'agent_declaration',
    name,
    config,
  };
}

/**
 * Parse a tool declaration
 */
export function parseToolDeclaration(node: Parser.SyntaxNode): ToolDeclaration {
  // tool <identifier> '(' <parameter_list>? ')' <return_type_annotation>? <block_statement>
  const children = node.children.filter(c => c.type !== 'tool');
  const nameNode = children.find(c => c.type === 'identifier');
  const paramListNode = children.find(c => c.type === 'parameter_list');
  const returnTypeNode = children.find(
    c => c.type === 'return_type_annotation'
  );
  const blockNode = children.find(c => c.type === 'block_statement');

  if (!nameNode || !blockNode) {
    throw new Error('Invalid tool_declaration: missing name or body');
  }

  const name = nameNode.text;
  const parameters = paramListNode ? parseParameterList(paramListNode) : [];
  const returnType = returnTypeNode
    ? parseReturnTypeAnnotation(returnTypeNode)
    : undefined;
  const body = parseBlockStatement(blockNode);

  return {
    type: 'tool_declaration',
    name,
    parameters,
    returnType,
    body,
  };
}

/**
 * Parse a parameter list
 */
function parseParameterList(node: Parser.SyntaxNode): ToolParameter[] {
  const parameters: ToolParameter[] = [];
  for (const child of node.children) {
    if (child.type === 'parameter') {
      parameters.push(parseParameter(child));
    }
  }
  return parameters;
}

/**
 * Parse a single parameter
 */
function parseParameter(node: Parser.SyntaxNode): ToolParameter {
  // parameter: identifier optional('?') optional(type_annotation)
  const identifierNode = node.children.find(c => c.type === 'identifier');
  const hasOptional = node.children.some(c => c.type === '?');
  const typeAnnotationNode = node.children.find(
    c => c.type === 'type_annotation'
  );

  if (!identifierNode) {
    throw new Error('Invalid parameter: missing identifier');
  }

  return {
    name: identifierNode.text,
    optional: hasOptional,
    typeAnnotation: typeAnnotationNode
      ? parseTypeAnnotation(typeAnnotationNode)
      : undefined,
  };
}

/**
 * Parse a type annotation
 */
function parseTypeAnnotation(node: Parser.SyntaxNode): TypeExpression {
  // type_annotation: ':' type_expression
  const typeExprNode = node.children.find(c => c.type === 'type_expression');
  if (!typeExprNode) {
    throw new Error('Invalid type_annotation: missing type_expression');
  }
  return parseTypeExpression(typeExprNode);
}

/**
 * Parse a return type annotation
 */
function parseReturnTypeAnnotation(node: Parser.SyntaxNode): TypeExpression {
  // return_type_annotation: ':' type_expression
  const typeExprNode = node.children.find(c => c.type === 'type_expression');
  if (!typeExprNode) {
    throw new Error('Invalid return_type_annotation: missing type_expression');
  }
  return parseTypeExpression(typeExprNode);
}

/**
 * Parse a type expression
 */
function parseTypeExpression(node: Parser.SyntaxNode): TypeExpression {
  const child = node.children[0];

  if (!child) {
    throw new Error('Invalid type_expression: no children');
  }

  switch (child.type) {
    case 'primitive_type':
      return parsePrimitiveType(child);
    case 'array_type':
      return parseArrayType(child);
    case 'object_type':
      return parseObjectType(child);
    case 'union_type':
      return parseUnionType(child);
    default:
      throw new Error(`Unknown type expression: ${child.type}`);
  }
}

/**
 * Parse a primitive type
 */
function parsePrimitiveType(node: Parser.SyntaxNode): PrimitiveType {
  const value = node.text as 'string' | 'number' | 'boolean' | 'any' | 'null';
  return {
    type: 'primitive_type',
    value,
  };
}

/**
 * Parse an array type
 */
function parseArrayType(node: Parser.SyntaxNode): ArrayType {
  // array_type: type_expression '[' ']'
  const typeExprNode = node.children.find(c => c.type === 'type_expression');
  if (!typeExprNode) {
    throw new Error('Invalid array_type: missing type_expression');
  }

  return {
    type: 'array_type',
    elementType: parseTypeExpression(typeExprNode),
  };
}

/**
 * Parse an object type
 */
function parseObjectType(node: Parser.SyntaxNode): ObjectType {
  // object_type: '{' type_property_list? '}'
  const typePropertyListNode = node.children.find(
    c => c.type === 'type_property_list'
  );
  const properties = typePropertyListNode
    ? parseTypePropertyList(typePropertyListNode)
    : [];

  return {
    type: 'object_type',
    properties,
  };
}

/**
 * Parse a type property list
 */
function parseTypePropertyList(node: Parser.SyntaxNode): TypeProperty[] {
  const properties: TypeProperty[] = [];
  for (const child of node.children) {
    if (child.type === 'type_property') {
      properties.push(parseTypeProperty(child));
    }
  }
  return properties;
}

/**
 * Parse a type property
 */
function parseTypeProperty(node: Parser.SyntaxNode): TypeProperty {
  // type_property: identifier optional('?') ':' type_expression
  const identifierNode = node.children.find(c => c.type === 'identifier');
  const hasOptional = node.children.some(c => c.type === '?');
  const typeExprNode = node.children.find(c => c.type === 'type_expression');

  if (!identifierNode || !typeExprNode) {
    throw new Error(
      'Invalid type_property: missing identifier or type_expression'
    );
  }

  return {
    name: identifierNode.text,
    optional: hasOptional,
    typeAnnotation: parseTypeExpression(typeExprNode),
  };
}

/**
 * Parse a union type
 */
function parseUnionType(node: Parser.SyntaxNode): UnionType {
  // union_type: type_expression '|' type_expression
  // Collect all type expressions (flattening nested unions)
  const types: TypeExpression[] = [];

  function collectTypes(n: Parser.SyntaxNode) {
    for (const child of n.children) {
      if (child.type === 'type_expression') {
        const typeExpr = parseTypeExpression(child);
        if (typeExpr.type === 'union_type') {
          // Flatten nested unions
          types.push(...typeExpr.types);
        } else {
          types.push(typeExpr);
        }
      }
    }
  }

  collectTypes(node);

  return {
    type: 'union_type',
    types,
  };
}
