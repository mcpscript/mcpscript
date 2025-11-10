// Code generator tests for statements
import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import { generateCode } from '../../codegen.js';

describe('Code Generator - Statements', () => {
  it('should generate code for simple assignment and print', () => {
    const source = `
message = "Hello World"
print(message)
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('let message = "Hello World";');
    expect(code).toContain('print(message);');
  });

  it('should generate code for MCP declaration', () => {
    const source = `
mcp filesystem {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem"]
}
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('StdioClientTransport');
    expect(code).toContain('command: "npx"');
    expect(code).toContain('const filesystem = {}');
    expect(code).toContain('await __filesystem_client.connect');
    expect(code).toContain('__filesystem_client.listTools()');
  });

  it('should generate code for MCP tool calls', () => {
    const source = `
mcp server { command: "cmd", args: [] }
result = server.getTool("arg1", "arg2")
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('const server = {}');
    expect(code).toContain(
      'let result = await server.getTool("arg1", "arg2");'
    );
  });

  it('should generate code with cleanup', () => {
    const source = `
mcp server { command: "cmd", args: [] }
x = 1
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('// Cleanup');
    expect(code).toContain('for (const client of Object.values(__mcpClients))');
    expect(code).toContain('await client.close()');
  });
});
