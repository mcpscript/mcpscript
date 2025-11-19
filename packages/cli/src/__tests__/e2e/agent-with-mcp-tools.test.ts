// Test for agents using MCP server tools
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { parseSource, generateCode } from '@mcpscript/transpiler';
import { executeInVM } from '@mcpscript/runtime';
import * as fs from 'fs';
import * as path from 'path';
import type { MockInstance } from 'vitest';

describe('Agent with MCP Server Tools', () => {
  let consoleSpy: MockInstance;
  const testDir = path.join(process.cwd(), 'tmp_e2e_test_agent_mcp');

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should handle agent with MCP server in tools array', async () => {
    const source = `
      // Configure a local AI model
      model gpt {
        provider: "openai",
        apiKey: "ollama",
        baseURL: "http://localhost:11434/v1",
        model: "gpt-oss:20b",
        temperature: 0.5
      }

      // Set up an MCP server for file operations
      mcp filesystem {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-filesystem@latest", "${testDir}"],
        stderr: "ignore"
      }

      // Create a test file
      filesystem.write_file("${testDir}/test.txt", "The answer is 42.")

      // Declare an agent with access to filesystem tools
      agent fileAssistant {
        model: gpt,
        systemPrompt: "You are a helpful file assistant. Help users work with files efficiently.",
        tools: [filesystem]
      }

      // Use the agent to read and analyze the file
      "Read the file ${testDir}/test.txt and tell me what number is mentioned in it" | fileAssistant
    `;

    const ast = parseSource(source);
    const code = generateCode(ast);

    // This should not hang and should complete successfully
    // The main test is that this completes without timing out
    await executeInVM(code, { timeout: 10000 });

    // If we reach here, the agent executed successfully
    expect(true).toBe(true);
  }, 15000);

  it('should handle agent with mixed user-defined and MCP tools', async () => {
    const source = `
      // Configure a local AI model
      model gpt {
        provider: "openai",
        apiKey: "ollama",
        baseURL: "http://localhost:11434/v1",
        model: "gpt-oss:20b",
        temperature: 0.5
      }

      // Set up an MCP server
      mcp filesystem {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-filesystem@latest", "${testDir}"],
        stderr: "ignore"
      }

      // Define a custom tool
      tool multiply(a, b) {
        return a * b
      }

      // Declare an agent with both MCP and user-defined tools
      agent mixedAssistant {
        model: gpt,
        systemPrompt: "You are a helpful assistant with file and math capabilities.",
        tools: [filesystem, multiply]
      }

      // Use the agent
      "What is 6 times 7?" | mixedAssistant
    `;

    const ast = parseSource(source);
    const code = generateCode(ast);

    // This should work with mixed tools
    // The main test is that this completes without timing out
    await executeInVM(code, { timeout: 10000 });

    // If we reach here, the agent with mixed tools executed successfully
    expect(true).toBe(true);
  }, 15000);
});
