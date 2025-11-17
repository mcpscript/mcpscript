// Declaration parsers for MCP Script
import Parser from 'tree-sitter';
import {
  MCPDeclaration,
  ModelDeclaration,
  AgentDeclaration,
  ToolDeclaration,
  ObjectLiteral,
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
  // tool <identifier> '(' <parameter_list>? ')' <block_statement>
  const children = node.children.filter(c => c.type !== 'tool');
  const nameNode = children.find(c => c.type === 'identifier');
  const paramListNode = children.find(c => c.type === 'parameter_list');
  const blockNode = children.find(c => c.type === 'block_statement');

  if (!nameNode || !blockNode) {
    throw new Error('Invalid tool_declaration: missing name or body');
  }

  const name = nameNode.text;
  const parameters = paramListNode ? parseParameterList(paramListNode) : [];
  const body = parseBlockStatement(blockNode);

  return {
    type: 'tool_declaration',
    name,
    parameters,
    body,
  };
}

/**
 * Parse a parameter list
 */
function parseParameterList(node: Parser.SyntaxNode): string[] {
  const parameters: string[] = [];
  for (const child of node.children) {
    if (child.type === 'identifier') {
      parameters.push(child.text);
    }
  }
  return parameters;
}
