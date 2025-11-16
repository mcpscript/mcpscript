// Codegen tests for agent delegation operator
import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import { generateCodeForTest } from '../test-helpers.js';

describe('Codegen - Agent Delegation', () => {
  it('should generate agent delegation with string literal', () => {
    const statements = parseSource(`
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent DataAnalyst { model: claude }
      result = "Analyze this data" -> DataAnalyst
    `);
    const code = generateCodeForTest(statements);

    expect(code).toContain('await DataAnalyst.run("Analyze this data")');
  });

  it('should generate agent delegation with variable prompt', () => {
    const statements = parseSource(`
      model gpt4 { provider: "openai", model: "gpt-4o" }
      agent CodeReviewer { model: gpt4 }
      prompt = "Review this code"
      result = prompt -> CodeReviewer
    `);
    const code = generateCodeForTest(statements);

    expect(code).toContain('let prompt = "Review this code"');
    expect(code).toContain('await CodeReviewer.run(prompt)');
  });

  it('should generate multiple agent delegations', () => {
    const statements = parseSource(`
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent Agent1 { model: claude }
      agent Agent2 { model: claude }
      result1 = "Task 1" -> Agent1
      result2 = "Task 2" -> Agent2
    `);
    const code = generateCodeForTest(statements);

    expect(code).toContain('await Agent1.run("Task 1")');
    expect(code).toContain('await Agent2.run("Task 2")');
  });

  it('should generate agent delegation as expression statement', () => {
    const statements = parseSource(`
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent DataAnalyst { model: claude }
      "Analyze data" -> DataAnalyst
    `);
    const code = generateCodeForTest(statements);

    expect(code).toContain('await DataAnalyst.run("Analyze data")');
  });

  it('should generate simple agent delegation call', () => {
    const statements = parseSource(`
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent DataAnalyst { model: claude }
      result = "prompt" -> DataAnalyst
    `);
    const code = generateCodeForTest(statements);

    expect(code).toContain('await DataAnalyst.run("prompt")');
  });

  it('should handle agent delegation returning conversation', () => {
    const statements = parseSource(`
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent DataAnalyst { model: claude }
      conv = "prompt" -> DataAnalyst
    `);
    const code = generateCodeForTest(statements);

    expect(code).toContain('let conv = await DataAnalyst.run("prompt")');
  });

  it('should generate agent delegation with agent that has tools', () => {
    const statements = parseSource(`
      mcp filesystem { command: "npx", args: ["-y", "@modelcontextprotocol/server-filesystem"] }
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent FileAgent { model: claude, tools: [filesystem.readFile] }
      result = "Read the file" -> FileAgent
    `);
    const code = generateCodeForTest(statements);

    expect(code).toContain('// Initialize MCP servers using LlamaIndex');
    expect(code).toContain('// Initialize model configurations');
    expect(code).toContain('// Initialize agent configurations');
    expect(code).toContain('await FileAgent.run("Read the file")');
  });

  it('should handle agent delegation in control flow', () => {
    const statements = parseSource(`
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent DataAnalyst { model: claude }
      useAgent = true
      if (useAgent) {
        result = "Analyze" -> DataAnalyst
      }
    `);
    const code = generateCodeForTest(statements);

    expect(code).toContain('if (useAgent)');
    expect(code).toContain('await DataAnalyst.run("Analyze")');
  });

  it('should preserve agent delegation in complex expressions', () => {
    const statements = parseSource(`
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent Agent1 { model: claude }
      result = ("prompt" -> Agent1)
    `);
    const code = generateCodeForTest(statements);

    expect(code).toContain('await Agent1.run("prompt")');
  });
});
