// Code generator tests for statements
import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import { generateCodeForTest } from '../test-helpers.js';

describe('Code Generator - Statements', () => {
  it('should generate code for simple assignment and print', () => {
    const source = `
message = "Hello World"
print(message)
    `.trim();

    const ast = parseSource(source);
    const code = generateCodeForTest(ast);

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
    const code = generateCodeForTest(ast);

    expect(code).toContain('__llamaindex_mcp');
    expect(code).toContain('command: "npx"');
    expect(code).toContain(
      'const filesystem = __createToolProxy(__filesystem_tools)'
    );
    expect(code).toContain('await __filesystem_server.tools()');
  });

  it('should generate code for MCP tool calls', () => {
    const source = `
mcp server { command: "cmd", args: [] }
result = server.getTool("arg1", "arg2")
    `.trim();

    const ast = parseSource(source);
    const code = generateCodeForTest(ast);

    expect(code).toContain('const server = __createToolProxy(__server_tools)');
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
    const code = generateCodeForTest(ast);

    expect(code).toContain('// Cleanup MCP servers');
    expect(code).toContain(
      'Promise.all(__mcpServers.map(server => server.cleanup()))'
    );
  });

  it('should generate code for member property assignment', () => {
    const source = `
obj = { prop: 42 }
obj.prop = "new value"
    `.trim();

    const ast = parseSource(source);
    const code = generateCodeForTest(ast);

    expect(code).toContain('let obj = { prop: 42 };');
    expect(code).toContain('obj.prop = "new value";');
  });

  it('should generate code for array index assignment', () => {
    const source = `
arr = [1, 2, 3]
arr[0] = 42
    `.trim();

    const ast = parseSource(source);
    const code = generateCodeForTest(ast);

    expect(code).toContain('let arr = [1, 2, 3];');
    expect(code).toContain('arr[0] = 42;');
  });

  it('should generate code for complex member assignment', () => {
    const source = `
data = { nested: { prop: "old" } }
data.nested.prop = "new"
    `.trim();

    const ast = parseSource(source);
    const code = generateCodeForTest(ast);

    expect(code).toContain('let data = { nested: { prop: "old" } };');
    expect(code).toContain('data.nested.prop = "new";');
  });

  it('should generate code for complex bracket assignment', () => {
    const source = `
matrix = [[1, 2], [3, 4]]
row = 0
col = 1
matrix[row][col] = 99
    `.trim();

    const ast = parseSource(source);
    const code = generateCodeForTest(ast);

    expect(code).toContain('let matrix = [[1, 2], [3, 4]];');
    expect(code).toContain('let row = 0;');
    expect(code).toContain('let col = 1;');
    expect(code).toContain('matrix[row][col] = 99;');
  });

  it('should generate code for mixed assignment types', () => {
    const source = `
obj = { arr: [1, 2, 3] }
obj.arr[1] = "modified"
value = obj.arr[1]
    `.trim();

    const ast = parseSource(source);
    const code = generateCodeForTest(ast);

    expect(code).toContain('let obj = { arr: [1, 2, 3] };');
    expect(code).toContain('obj.arr[1] = "modified";');
    expect(code).toContain('let value = obj.arr[1];');
  });
});
