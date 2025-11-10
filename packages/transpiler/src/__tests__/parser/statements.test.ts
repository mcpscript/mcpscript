// Parser tests for statements
import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import {
  MCPDeclaration,
  Assignment,
  ExpressionStatement,
  CallExpression,
  MemberExpression,
  Identifier,
  StringLiteral,
  NumberLiteral,
  ArrayLiteral,
} from '../../ast.js';

describe('Parser - Statements', () => {
  describe('Assignments', () => {
    it('should parse simple assignments', () => {
      const statements = parseSource('x = 42');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      expect(stmt.type).toBe('assignment');
      expect((stmt.target as Identifier).name).toBe('x');
      expect((stmt.value as NumberLiteral).value).toBe(42);
    });

    it('should parse multiple assignments', () => {
      const statements = parseSource('x = 1\ny = 2\nz = 3');
      expect(statements).toHaveLength(3);
      expect(((statements[0] as Assignment).target as Identifier).name).toBe(
        'x'
      );
      expect(((statements[1] as Assignment).target as Identifier).name).toBe(
        'y'
      );
      expect(((statements[2] as Assignment).target as Identifier).name).toBe(
        'z'
      );
    });

    it('should parse assignment with identifier reference', () => {
      const statements = parseSource('x = y');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      expect((stmt.target as Identifier).name).toBe('x');
      const id = stmt.value as Identifier;
      expect(id.type).toBe('identifier');
      expect(id.name).toBe('y');
    });
  });

  describe('MCP Declarations', () => {
    it('should parse simple MCP declaration', () => {
      const statements = parseSource(
        'mcp filesystem { command: "npx", args: ["-y", "@modelcontextprotocol/server-filesystem"] }'
      );
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as MCPDeclaration;
      expect(stmt.type).toBe('mcp_declaration');
      expect(stmt.name).toBe('filesystem');
      expect(stmt.config.type).toBe('object');
      expect(stmt.config.properties).toHaveLength(2);
      expect(stmt.config.properties[0].key).toBe('command');
      expect((stmt.config.properties[0].value as StringLiteral).value).toBe(
        'npx'
      );
      expect(stmt.config.properties[1].key).toBe('args');
      const args = stmt.config.properties[1].value as ArrayLiteral;
      expect(args.elements).toHaveLength(2);
    });

    it('should parse MCP declaration with multiple properties', () => {
      const statements = parseSource(
        'mcp server { command: "cmd", args: [], timeout: 5000 }'
      );
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as MCPDeclaration;
      expect(stmt.config.properties).toHaveLength(3);
      expect(stmt.config.properties[2].key).toBe('timeout');
      expect((stmt.config.properties[2].value as NumberLiteral).value).toBe(
        5000
      );
    });

    it('should parse empty MCP declaration', () => {
      const statements = parseSource('mcp server {}');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as MCPDeclaration;
      expect(stmt.type).toBe('mcp_declaration');
      expect(stmt.name).toBe('server');
      expect(stmt.config.properties).toHaveLength(0);
    });
  });

  describe('Expression Statements', () => {
    it('should parse function call as statement', () => {
      const statements = parseSource('print("hello")');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as ExpressionStatement;
      expect(stmt.type).toBe('expression_statement');
      const call = stmt.expression as CallExpression;
      expect(call.type).toBe('call');
      expect((call.callee as Identifier).name).toBe('print');
    });

    it('should parse member call as statement', () => {
      const statements = parseSource('obj.method()');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as ExpressionStatement;
      const call = stmt.expression as CallExpression;
      const member = call.callee as MemberExpression;
      expect((member.object as Identifier).name).toBe('obj');
      expect(member.property).toBe('method');
    });
  });
});
