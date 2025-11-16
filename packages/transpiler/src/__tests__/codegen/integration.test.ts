// Code generator integration tests
import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import { generateCodeForTest } from '../test-helpers.js';

describe('Code Generator - Integration', () => {
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
    const code = generateCodeForTest(ast);

    // Check MCP initialization
    expect(code).toContain('// Initialize MCP servers using LlamaIndex');
    expect(code).toContain('__llamaindex_mcp');

    // Check MCP setup
    expect(code).toContain(
      'const filesystem = __createToolProxy(__filesystem_tools)'
    );
    expect(code).toContain('await __filesystem_server.tools()');

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
    expect(code).toContain('// Cleanup MCP servers');
  });
});
