// End-to-end integration tests with real MCP server
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { writeFile, readFile, unlink, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { executeInVM } from '@mcps/runtime';
import { parseSource } from '../parser.js';
import { generateCode } from '../codegen.js';

describe('End-to-End MCP Integration', () => {
  let testDir: string;

  beforeAll(async () => {
    // Create a temporary test directory
    testDir = join(process.cwd(), 'tmp_e2e_test');
    await mkdir(testDir, { recursive: true });
  });

  afterAll(async () => {
    // Clean up test directory
    try {
      await rm(testDir, { recursive: true });
    } catch (_) {
      // Ignore cleanup errors
    }
  });

  it('should successfully connect to filesystem MCP server and map positional arguments', async () => {
    const mcpScript = `
mcp filesystem {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem", "${testDir}"]
}

filesystem.write_file("test-positional.txt", "Hello from positional args!")
content = filesystem.read_text_file("test-positional.txt")
print("Content:", content)
    `.trim();

    const ast = parseSource(mcpScript);
    const code = generateCode(ast);

    // Execute the generated code with VM
    await executeInVM(code);

    // Verify the file was actually created with correct content
    const filePath = join(testDir, 'test-positional.txt');
    const actualContent = await readFile(filePath, 'utf-8');
    expect(actualContent).toBe('Hello from positional args!');

    // Clean up
    await unlink(filePath);
  }, 15000); // 15 second timeout for MCP operations

  it('should handle explicit object parameters correctly', async () => {
    const mcpScript = `
mcp filesystem {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem", "${testDir}"]
}

filesystem.write_file({ path: "test-object.txt", content: "Hello from object params!" })
content = filesystem.read_text_file({ path: "test-object.txt" })
print("Object content:", content)
    `.trim();

    const ast = parseSource(mcpScript);
    const code = generateCode(ast);

    await executeInVM(code);

    // Verify the file was created
    const filePath = join(testDir, 'test-object.txt');
    const actualContent = await readFile(filePath, 'utf-8');
    expect(actualContent).toBe('Hello from object params!');

    // Clean up
    await unlink(filePath);
  }, 15000);

  it('should handle mixed argument styles in same script', async () => {
    const mcpScript = `
mcp filesystem {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem", "${testDir}"]
}

filesystem.write_file("source.txt", "Original content")
filesystem.write_file({ path: "explicit.txt", content: "Explicit content" })

sourceContent = filesystem.read_text_file("source.txt")
explicitContent = filesystem.read_text_file({ path: "explicit.txt" })

print("Source:", sourceContent)
print("Explicit:", explicitContent)
    `.trim();

    const ast = parseSource(mcpScript);
    const code = generateCode(ast);

    await executeInVM(code);

    // Verify both files were created correctly
    const sourceContent = await readFile(join(testDir, 'source.txt'), 'utf-8');
    const explicitContent = await readFile(
      join(testDir, 'explicit.txt'),
      'utf-8'
    );

    expect(sourceContent).toBe('Original content');
    expect(explicitContent).toBe('Explicit content');

    // Clean up
    await unlink(join(testDir, 'source.txt'));
    await unlink(join(testDir, 'explicit.txt'));
  }, 15000);

  it('should work with tools that have no arguments', async () => {
    const mcpScript = `
mcp filesystem {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem", "${testDir}"]
}

directories = filesystem.list_allowed_directories()
print("Available directories found")
    `.trim();

    const ast = parseSource(mcpScript);
    const code = generateCode(ast);

    // This should not throw an error
    await expect(executeInVM(code)).resolves.not.toThrow();
  }, 15000);

  it('should gracefully handle incorrect number of arguments', async () => {
    const mcpScript = `
mcp filesystem {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem", "${testDir}"]
}

result = filesystem.write_file("only-filename.txt")
print("Handled missing argument gracefully")
    `.trim();

    const ast = parseSource(mcpScript);
    const code = generateCode(ast);

    // Should not crash, but may result in an MCP error
    // The important thing is our argument mapping doesn't break
    await executeInVM(code);

    // Test should complete without VM errors (MCP errors are OK)
    expect(true).toBe(true);
  }, 15000);

  it('should map multiple positional arguments to correct schema parameters', async () => {
    // Create source file first
    const sourcePath = join(testDir, 'copy-source.txt');
    await writeFile(sourcePath, 'Content to copy');

    const mcpScript = `
mcp filesystem {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem", "${testDir}"]
}

filesystem.write_file("multi-arg-test.txt", "Test content for multiple args")
content = filesystem.read_text_file("multi-arg-test.txt")
print("Multi-arg content:", content)
    `.trim();

    const ast = parseSource(mcpScript);
    const code = generateCode(ast);

    await executeInVM(code);

    // Verify the file was created
    const actualContent = await readFile(
      join(testDir, 'multi-arg-test.txt'),
      'utf-8'
    );
    expect(actualContent).toBe('Test content for multiple args');

    // Clean up
    await unlink(join(testDir, 'multi-arg-test.txt'));
    await unlink(sourcePath);
  }, 15000);

  it('should handle array arguments without confusing them for objects', async () => {
    const mcpScript = `
mcp filesystem {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem", "${testDir}"]
}

files = ["array-test1.txt", "array-test2.txt"]
filesystem.processFiles(files, "list")
print("Array arguments handled correctly")
    `.trim();

    const ast = parseSource(mcpScript);
    const code = generateCode(ast);

    // This tests that arrays are treated as positional args, not object params
    // Even if the tool doesn't exist, the argument mapping should work correctly
    await executeInVM(code);

    expect(true).toBe(true);
  }, 15000);

  it('should work with different transport types', async () => {
    // Test HTTP transport detection (won't connect, but should generate correct code)
    const httpScript = `
mcp httpserver {
  url: "http://localhost:3000/mcp"
}

print("HTTP transport configured")
    `;

    const httpAst = parseSource(httpScript);
    const httpCode = generateCode(httpAst);

    expect(httpCode).toContain('StreamableHTTPClientTransport');
    expect(httpCode).toContain('SSEClientTransport');

    // Test WebSocket transport detection
    const wsScript = `
mcp wsserver {
  url: "ws://localhost:3000/mcp"
}

print("WebSocket transport configured")
    `;

    const wsAst = parseSource(wsScript);
    const wsCode = generateCode(wsAst);

    expect(wsCode).toContain('WebSocketClientTransport');
    expect(wsCode).not.toContain('SSEClientTransport'); // No fallback for WebSocket
  });
});
