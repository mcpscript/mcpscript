// Codegen tests for agent delegation operator
import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import { generateCode } from '../../codegen.js';

describe('Codegen - Agent Delegation', () => {
  it('should generate agent delegation with string literal', () => {
    const statements = parseSource(`
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent DataAnalyst { model: claude }
      result = "Analyze this data" -> DataAnalyst
    `);
    const code = generateCode(statements);

    expect(code).toContain('__Conversation');
    expect(code).toContain('DataAnalyst.llm.exec');
    expect(code).toContain('"Analyze this data"');
    expect(code).toContain('newMessages');
    expect(code).toContain('toolCalls');
  });

  it('should generate agent delegation with variable prompt', () => {
    const statements = parseSource(`
      model gpt4 { provider: "openai", model: "gpt-4o" }
      agent CodeReviewer { model: gpt4 }
      prompt = "Review this code"
      result = prompt -> CodeReviewer
    `);
    const code = generateCode(statements);

    expect(code).toContain('let prompt = "Review this code"');
    expect(code).toContain('__Conversation');
    expect(code).toContain('CodeReviewer.llm.exec');
  });

  it('should generate multiple agent delegations', () => {
    const statements = parseSource(`
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent Agent1 { model: claude }
      agent Agent2 { model: claude }
      result1 = "Task 1" -> Agent1
      result2 = "Task 2" -> Agent2
    `);
    const code = generateCode(statements);

    expect(code).toContain('Agent1.llm.exec');
    expect(code).toContain('Agent2.llm.exec');
    expect(code).toContain('"Task 1"');
    expect(code).toContain('"Task 2"');
  });

  it('should generate agent delegation as expression statement', () => {
    const statements = parseSource(`
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent DataAnalyst { model: claude }
      "Analyze data" -> DataAnalyst
    `);
    const code = generateCode(statements);

    expect(code).toContain('__Conversation');
    expect(code).toContain('DataAnalyst.llm.exec');
    expect(code).toContain('"Analyze data"');
  });

  it('should wrap agent delegation in async IIFE', () => {
    const statements = parseSource(`
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent DataAnalyst { model: claude }
      result = "prompt" -> DataAnalyst
    `);
    const code = generateCode(statements);

    expect(code).toContain('await (async () => {');
    expect(code).toContain('const conv = new __Conversation');
    expect(code).toContain('const messages = conv.getMessages()');
    expect(code).toContain('return finalConv;');
    expect(code).toContain('})()');
  });

  it('should handle agent loop with tool calls', () => {
    const statements = parseSource(`
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent DataAnalyst { model: claude }
      conv = "prompt" -> DataAnalyst
    `);
    const code = generateCode(statements);

    expect(code).toContain('let exit = false;');
    expect(code).toContain('do {');
    expect(code).toContain('const { newMessages, toolCalls }');
    expect(code).toContain('exit = toolCalls.length === 0;');
    expect(code).toContain('} while (!exit);');
  });

  it('should generate agent delegation with agent that has tools', () => {
    const statements = parseSource(`
      mcp filesystem { command: "npx", args: ["-y", "@modelcontextprotocol/server-filesystem"] }
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent FileAgent { model: claude, tools: [filesystem.readFile] }
      result = "Read the file" -> FileAgent
    `);
    const code = generateCode(statements);

    expect(code).toContain('// Initialize MCP servers using LlamaIndex');
    expect(code).toContain('// Initialize model configurations');
    expect(code).toContain('// Initialize agent configurations');
    expect(code).toContain('FileAgent.llm.exec');
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
    const code = generateCode(statements);

    expect(code).toContain('if (useAgent)');
    expect(code).toContain('DataAnalyst.llm.exec');
  });

  it('should preserve agent delegation in complex expressions', () => {
    const statements = parseSource(`
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent Agent1 { model: claude }
      result = ("prompt" -> Agent1)
    `);
    const code = generateCode(statements);

    expect(code).toContain('__Conversation');
    expect(code).toContain('Agent1.llm.exec');
  });
});
