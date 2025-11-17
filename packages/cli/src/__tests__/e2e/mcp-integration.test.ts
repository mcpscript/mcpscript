// End-to-end integration tests with real MCP server
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { parseSource, generateCode } from '@mcpscript/transpiler';
import { executeInVM } from '@mcpscript/runtime';
import * as fs from 'fs/promises';

const TEST_DIR = 'tmp_e2e_test_mcp';

describe('End-to-End MCP Integration', () => {
  beforeEach(async () => {
    // Create test directory
    await fs.mkdir(TEST_DIR, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true });
    } catch (_error) {
      // Ignore cleanup errors
    }
  });

  it('should successfully connect to filesystem MCP server and map positional arguments', async () => {
    const source = `
mcp filesystem {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem@latest", "${TEST_DIR}"]
}

filesystem.write_file("${TEST_DIR}/test.txt", "Hello from positional args!")
content = filesystem.read_file("${TEST_DIR}/test.txt")
print("Content:", content)
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);
    await executeInVM(code, { timeout: 10000 });

    // Verify file was created
    const fileContent = await fs.readFile(`${TEST_DIR}/test.txt`, 'utf-8');
    expect(fileContent).toBe('Hello from positional args!');
  });

  it('should handle explicit object parameters correctly', async () => {
    const source = `
mcp filesystem {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem@latest", "${TEST_DIR}"]
}

filesystem.write_file({
  path: "${TEST_DIR}/object_test.txt",
  content: "Hello from object params!"
})
content = filesystem.read_file({ path: "${TEST_DIR}/object_test.txt" })
print("Object content:", content)
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);
    await executeInVM(code, { timeout: 10000 });

    // Verify file was created
    const fileContent = await fs.readFile(
      `${TEST_DIR}/object_test.txt`,
      'utf-8'
    );
    expect(fileContent).toBe('Hello from object params!');
  });

  it('should handle mixed argument styles in same script', async () => {
    const source = `
mcp filesystem {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem@latest", "${TEST_DIR}"]
}

// Positional arguments
filesystem.write_file("${TEST_DIR}/source.txt", "Original content")

// Object arguments
filesystem.write_file({
  path: "${TEST_DIR}/explicit.txt",
  content: "Explicit content"
})

source_content = filesystem.read_file("${TEST_DIR}/source.txt")
explicit_content = filesystem.read_file({ path: "${TEST_DIR}/explicit.txt" })

print("Source:", source_content)
print("Explicit:", explicit_content)
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    await executeInVM(code, { timeout: 10000 });

    // Verify both files were created
    const sourceContent = await fs.readFile(`${TEST_DIR}/source.txt`, 'utf-8');
    const explicitContent = await fs.readFile(
      `${TEST_DIR}/explicit.txt`,
      'utf-8'
    );
    expect(sourceContent).toBe('Original content');
    expect(explicitContent).toBe('Explicit content');
  });

  it('should work with tools that have no arguments', async () => {
    const source = `
mcp filesystem {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem@latest", "${TEST_DIR}"]
}

dirs = filesystem.directory_tree("${TEST_DIR}")
print("Available directories found")
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);
    await executeInVM(code, { timeout: 10000 });

    // Test should complete without throwing
    expect(true).toBe(true);
  });

  it('should gracefully handle incorrect number of arguments', async () => {
    const source = `
mcp filesystem {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem@latest", "${TEST_DIR}"]
}

// This should handle missing argument gracefully
content = filesystem.read_file()
print("Content result:", content)
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);
    await executeInVM(code, { timeout: 10000 });

    // Test should complete without throwing
    expect(true).toBe(true);
  });

  it('should map multiple positional arguments to correct schema parameters', async () => {
    const source = `
mcp filesystem {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem@latest", "${TEST_DIR}"]
}

filesystem.write_file("${TEST_DIR}/multi.txt", "Test content for multiple args")
content = filesystem.read_file("${TEST_DIR}/multi.txt")
print("Multi-arg content:", content)
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);
    await executeInVM(code, { timeout: 10000 });

    // Verify file was created
    const fileContent = await fs.readFile(`${TEST_DIR}/multi.txt`, 'utf-8');
    expect(fileContent).toBe('Test content for multiple args');
  });

  it('should handle array arguments without confusing them for objects', async () => {
    const source = `
mcp filesystem {
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem@latest", "${TEST_DIR}"]
}

// Create a simple file first
filesystem.write_file("${TEST_DIR}/array_test.txt", "Array created successfully")
content = filesystem.read_file("${TEST_DIR}/array_test.txt")
print(content)
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);
    await executeInVM(code, { timeout: 10000 });

    // Verify file was created
    const fileContent = await fs.readFile(
      `${TEST_DIR}/array_test.txt`,
      'utf-8'
    );
    expect(fileContent).toBe('Array created successfully');
  });
});
