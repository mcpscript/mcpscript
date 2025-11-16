// Declaration parsers for MCP Script
import Parser from 'tree-sitter';
import {
  MCPDeclaration,
  ModelDeclaration,
  AgentDeclaration,
  ObjectLiteral,
} from '../ast.js';
import { parseExpression } from './expressions.js';

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
