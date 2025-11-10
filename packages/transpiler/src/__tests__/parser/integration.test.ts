// Parser integration tests
import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import {
  MCPDeclaration,
  Assignment,
  ExpressionStatement,
  CallExpression,
  MemberExpression,
  Identifier,
} from '../../ast.js';

describe('Parser - Integration', () => {
  it('should parse the MVP example program', () => {
    const code = `
mcp filesystem {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem"]
}

message = "Hello from MCP Script!"
filesystem.writeFile("greeting.txt", message)
content = filesystem.readFile("greeting.txt")
print(content)
      `.trim();

    const statements = parseSource(code);
    expect(statements).toHaveLength(5);

    // MCP declaration
    const mcpDecl = statements[0] as MCPDeclaration;
    expect(mcpDecl.type).toBe('mcp_declaration');
    expect(mcpDecl.name).toBe('filesystem');

    // Assignment
    const assignment = statements[1] as Assignment;
    expect(assignment.type).toBe('assignment');
    expect(assignment.variable).toBe('message');

    // First call (writeFile)
    const writeStmt = statements[2] as ExpressionStatement;
    const writeCall = writeStmt.expression as CallExpression;
    const writeMember = writeCall.callee as MemberExpression;
    expect((writeMember.object as Identifier).name).toBe('filesystem');
    expect(writeMember.property).toBe('writeFile');
    expect(writeCall.arguments).toHaveLength(2);

    // Second call (readFile)
    const readStmt = statements[3] as Assignment;
    expect(readStmt.variable).toBe('content');
    const readCall = readStmt.value as CallExpression;
    const readMember = readCall.callee as MemberExpression;
    expect((readMember.object as Identifier).name).toBe('filesystem');
    expect(readMember.property).toBe('readFile');

    // Print call
    const printStmt = statements[4] as ExpressionStatement;
    const printCall = printStmt.expression as CallExpression;
    expect((printCall.callee as Identifier).name).toBe('print');
  });

  it('should parse program with mixed statements', () => {
    const code = `
debug = true
config = { port: 8080, host: "localhost" }
result = process(getData(), "format")
print("Result:", result)
      `.trim();

    const statements = parseSource(code);
    expect(statements).toHaveLength(4);

    expect((statements[0] as Assignment).variable).toBe('debug');
    expect((statements[1] as Assignment).variable).toBe('config');
    expect((statements[2] as Assignment).variable).toBe('result');
    expect((statements[3] as ExpressionStatement).type).toBe(
      'expression_statement'
    );
  });
});
