// Code generator tests
import { describe, it, expect } from 'vitest';
import { parseSource } from '../parser.js';
import { generateCode } from '../codegen.js';

describe('Code Generator', () => {
  it('should generate code for simple assignment and print', () => {
    const source = `
message = "Hello World"
print(message)
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('import { Client }');
    expect(code).toContain('import { print }');
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

  it('should generate code for complete MVP example', () => {
    const source = `
mcp filesystem {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem"]
}

message = "Hello from MCP Script!"
filesystem.writeFile("greeting.txt", message)
content = filesystem.readFile("greeting.txt")
print(content)
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    // Check imports
    expect(code).toContain('import { Client }');
    expect(code).toContain('import { StdioClientTransport }');
    expect(code).toContain('import { print }');

    // Check MCP setup
    expect(code).toContain('const filesystem = {}');
    expect(code).toContain('await __filesystem_client.connect');

    // Check generated code
    expect(code).toContain('let message = "Hello from MCP Script!";');
    expect(code).toContain(
      'await filesystem.writeFile("greeting.txt", message);'
    );
    expect(code).toContain(
      'let content = await filesystem.readFile("greeting.txt");'
    );
    expect(code).toContain('print(content);');

    // Check cleanup
    expect(code).toContain('await client.close()');
  });

  it('should handle arrays and objects', () => {
    const source = `
config = { name: "test", port: 8080, enabled: true }
items = [1, 2, 3]
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain(
      'let config = { name: "test", port: 8080, enabled: true };'
    );
    expect(code).toContain('let items = [1, 2, 3];');
  });

  it('should handle function calls', () => {
    const source = `
result = processData("input", 42, true)
print("Result:", result)
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('let result = processData("input", 42, true);');
    expect(code).toContain('print("Result:", result);');
  });
});
