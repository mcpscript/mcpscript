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

    // Check MCP initialization
    expect(code).toContain('// Initialize MCP clients');
    expect(code).toContain('const __mcpClients = {}');

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

  it('should generate code for integer literals', () => {
    const source = `
zero = 0
positive = 42
large = 123456
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('let zero = 0;');
    expect(code).toContain('let positive = 42;');
    expect(code).toContain('let large = 123456;');
  });

  it('should generate code for decimal literals', () => {
    const source = `
pi = 3.14159
half = 0.5
fraction = .25
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('let pi = 3.14159;');
    expect(code).toContain('let half = 0.5;');
    expect(code).toContain('let fraction = 0.25;');
  });

  it('should generate code for scientific notation', () => {
    const source = `
large = 1e5
small = 2.5e-3
avogadro = 6.022e23
uppercase = 1E10
positive = 1.23E+5
negative = 4.56E-7
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('let large = 100000;');
    expect(code).toContain('let small = 0.0025;');
    expect(code).toContain('let avogadro = 6.022e+23;');
    expect(code).toContain('let uppercase = 10000000000;');
    expect(code).toContain('let positive = 123000;');
    expect(code).toContain('let negative = 4.56e-7;');
  });

  it('should generate code for numbers in arrays and objects', () => {
    const source = `
numbers = [42, 3.14, 1e5, 2.5e-3]
config = { port: 8080, ratio: 0.75, timeout: 1e4 }
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('let numbers = [42, 3.14, 100000, 0.0025];');
    expect(code).toContain(
      'let config = { port: 8080, ratio: 0.75, timeout: 10000 };'
    );
  });

  it('should generate code for numbers in function calls', () => {
    const source = `
result = calculate(42, 3.14, 1e-5)
mcp server { command: "test", timeout: 5000, retries: 3 }
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('let result = calculate(42, 3.14, 0.00001);');
    expect(code).toContain('timeout: 5000, retries: 3');
  });
});
