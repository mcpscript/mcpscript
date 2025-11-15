// Codegen tests for agent declarations
import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import { generateCode } from '../../codegen.js';

describe('Codegen - Agent Declarations', () => {
  it('should generate LlamaIndex-compatible agent with model', () => {
    const statements = parseSource(`
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent DataAnalyst { model: claude, description: "Analyzes data" }
    `);
    const code = generateCode(statements);
    expect(code).toContain('// Initialize agent configurations');
    expect(code).toContain('// Agent configuration for DataAnalyst');
    expect(code).toContain('const DataAnalyst = __llamaindex_agent({');
    expect(code).toContain('name: "DataAnalyst"');
    expect(code).toContain('description: "Analyzes data"');
    expect(code).toContain('llm: claude');
  });

  it('should generate agent with systemPrompt', () => {
    const statements = parseSource(`
      model gpt4 { provider: "openai", model: "gpt-4o" }
      agent CodeReviewer { model: gpt4, systemPrompt: "You are a code reviewer" }
    `);
    const code = generateCode(statements);
    expect(code).toContain('systemPrompt: "You are a code reviewer"');
  });

  it('should generate agent with tools as variable references', () => {
    const statements = parseSource(`
      mcp filesystem { command: "npx", args: ["-y", "@modelcontextprotocol/server-filesystem"] }
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent FileAgent { model: claude, tools: [filesystem.readFile, filesystem.writeFile] }
    `);
    const code = generateCode(statements);
    expect(code).toContain(
      'tools: [filesystem.readFile, filesystem.writeFile]'
    );
  });

  it('should generate agent with temperature override', () => {
    const statements = parseSource(`
      model gpt4 { provider: "openai", model: "gpt-4o" }
      agent CreativeWriter { model: gpt4, temperature: 0.9 }
    `);
    const code = generateCode(statements);
    expect(code).toContain('temperature: 0.9');
  });

  it('should generate agent with maxTokens override', () => {
    const statements = parseSource(`
      model gpt4 { provider: "openai", model: "gpt-4o" }
      agent LongFormWriter { model: gpt4, maxTokens: 10000 }
    `);
    const code = generateCode(statements);
    expect(code).toContain('maxTokens: 10000');
  });

  it('should throw error for agent without model', () => {
    const statements = parseSource(
      'agent Invalid { description: "Missing model" }'
    );
    expect(() => generateCode(statements)).toThrow(
      'Agent "Invalid" must specify a model reference'
    );
  });

  it('should handle agent with tools from variable assignment', () => {
    const statements = parseSource(`
      mcp filesystem { command: "npx" }
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      myTool = filesystem.readFile
      agent FileAgent { model: claude, tools: [myTool, filesystem.writeFile] }
    `);
    const code = generateCode(statements);
    expect(code).toContain('tools: [myTool, filesystem.writeFile]');
  });

  it('should generate multiple agents', () => {
    const statements = parseSource(`
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      model gpt4 { provider: "openai", model: "gpt-4o" }
      agent ResearchAgent { model: claude, description: "Researcher" }
      agent WriteAgent { model: gpt4, description: "Writer" }
    `);
    const code = generateCode(statements);
    expect(code).toContain('// Agent configuration for ResearchAgent');
    expect(code).toContain('// Agent configuration for WriteAgent');
    expect(code).toContain('const ResearchAgent = __llamaindex_agent({');
    expect(code).toContain('const WriteAgent = __llamaindex_agent({');
  });

  it('should not include agent declarations in main code section', () => {
    const statements = parseSource(`
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent DataAnalyst { model: claude }
      x = 42
    `);
    const code = generateCode(statements);
    expect(code).toContain('// Initialize agent configurations');
    expect(code).toContain('// Generated code');
    expect(code).toContain('let x = 42;');
    const mainCodeSection = code.split('// Generated code')[1];
    expect(mainCodeSection).not.toContain('agent DataAnalyst');
  });

  it('should handle agent with all parameters', () => {
    const statements = parseSource(`
      mcp filesystem { command: "npx" }
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent CompleteAgent {
        model: claude,
        description: "Complete configuration",
        systemPrompt: "You are helpful",
        tools: [filesystem.readFile],
        temperature: 0.7,
        maxTokens: 4000
      }
    `);
    const code = generateCode(statements);
    expect(code).toContain('name: "CompleteAgent"');
    expect(code).toContain('description: "Complete configuration"');
    expect(code).toContain('systemPrompt: "You are helpful"');
    expect(code).toContain('tools: [filesystem.readFile]');
    expect(code).toContain('llm: claude');
    expect(code).toContain('temperature: 0.7');
    expect(code).toContain('maxTokens: 4000');
  });

  it('should handle agents mixed with models and MCP servers', () => {
    const statements = parseSource(`
      mcp filesystem { command: "npx" }
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent DataAnalyst { model: claude, tools: [filesystem.readFile] }
      x = 42
    `);
    const code = generateCode(statements);
    expect(code).toContain('// Initialize MCP servers using LlamaIndex');
    expect(code).toContain('// Initialize model configurations');
    expect(code).toContain('// Initialize agent configurations');
    expect(code).toContain('__llamaindex_mcp');
    expect(code).toContain('const __models = {}');
    expect(code).toContain('const DataAnalyst = __llamaindex_agent({');
    expect(code).toContain('tools: [filesystem.readFile]');
    expect(code).toContain('// Generated code');
    expect(code).toContain('let x = 42;');
  });

  it('should handle agent with multiple tools from same server', () => {
    const statements = parseSource(`
      mcp filesystem { command: "npx" }
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent FileAgent { model: claude, tools: [filesystem.readFile, filesystem.writeFile, filesystem.listFiles] }
    `);
    const code = generateCode(statements);
    expect(code).toContain(
      'tools: [filesystem.readFile, filesystem.writeFile, filesystem.listFiles]'
    );
  });

  it('should handle agent without tools', () => {
    const statements = parseSource(`
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent SimpleAgent { model: claude, description: "No tools" }
    `);
    const code = generateCode(statements);
    expect(code).toContain('const SimpleAgent = __llamaindex_agent({');
    expect(code).toContain('llm: claude');
    expect(code).not.toContain('tools: [');
  });

  it('should generate agents in correct order with models', () => {
    const statements = parseSource(`
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent FirstAgent { model: claude }
      model gpt4 { provider: "openai", model: "gpt-4o" }
      agent SecondAgent { model: gpt4 }
    `);
    const code = generateCode(statements);

    // Models should be initialized before agents
    const modelIndex = code.indexOf('// Initialize model configurations');
    const agentIndex = code.indexOf('// Initialize agent configurations');
    expect(modelIndex).toBeLessThan(agentIndex);

    // Both agents should be present
    expect(code).toContain('const FirstAgent = __llamaindex_agent({');
    expect(code).toContain('const SecondAgent = __llamaindex_agent({');
  });
});
