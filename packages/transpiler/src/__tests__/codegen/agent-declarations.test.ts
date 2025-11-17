// Codegen tests for agent declarations
import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import { generateCodeForTest } from '../test-helpers.js';

describe('Codegen - Agent Declarations', () => {
  it('should generate agent with model', () => {
    const statements = parseSource(`
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent DataAnalyst { model: claude, description: "Analyzes data" }
    `);
    const code = generateCodeForTest(statements);
    expect(code).toContain('// Initialize agent configurations');
    expect(code).toContain('// Agent configuration for DataAnalyst');
    expect(code).toContain('const DataAnalyst = new __Agent({');
    expect(code).toContain('name: "DataAnalyst"');
    expect(code).toContain('description: "Analyzes data"');
    expect(code).toContain('llm: claude');
  });

  it('should generate agent with systemPrompt', () => {
    const statements = parseSource(`
      model gpt4 { provider: "openai", model: "gpt-4o" }
      agent CodeReviewer { model: gpt4, systemPrompt: "You are a code reviewer" }
    `);
    const code = generateCodeForTest(statements);
    expect(code).toContain('systemPrompt: "You are a code reviewer"');
  });

  it('should generate agent with tools as variable references', () => {
    const statements = parseSource(`
      mcp filesystem { command: "npx", args: ["-y", "@modelcontextprotocol/server-filesystem"] }
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent FileAgent { model: claude, tools: [filesystem.readFile, filesystem.writeFile] }
    `);
    const code = generateCodeForTest(statements);
    expect(code).toContain(
      'tools: [filesystem.readFile, filesystem.writeFile]'
    );
  });

  it('should throw error for agent without model', () => {
    const statements = parseSource(
      'agent Invalid { description: "Missing model" }'
    );
    expect(() => generateCodeForTest(statements)).toThrow(
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
    const code = generateCodeForTest(statements);
    expect(code).toContain('tools: [myTool, filesystem.writeFile]');
  });

  it('should generate multiple agents', () => {
    const statements = parseSource(`
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      model gpt4 { provider: "openai", model: "gpt-4o" }
      agent ResearchAgent { model: claude, description: "Researcher" }
      agent WriteAgent { model: gpt4, description: "Writer" }
    `);
    const code = generateCodeForTest(statements);
    expect(code).toContain('// Agent configuration for ResearchAgent');
    expect(code).toContain('// Agent configuration for WriteAgent');
    expect(code).toContain('const ResearchAgent = new __Agent({');
    expect(code).toContain('const WriteAgent = new __Agent({');
  });

  it('should not include agent declarations in main code section', () => {
    const statements = parseSource(`
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent DataAnalyst { model: claude }
      x = 42
    `);
    const code = generateCodeForTest(statements);
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
        tools: [filesystem.readFile]
      }
    `);
    const code = generateCodeForTest(statements);
    expect(code).toContain('name: "CompleteAgent"');
    expect(code).toContain('description: "Complete configuration"');
    expect(code).toContain('systemPrompt: "You are helpful"');
    expect(code).toContain('tools: [filesystem.readFile]');
    expect(code).toContain('llm: claude');
  });

  it('should handle agents mixed with models and MCP servers', () => {
    const statements = parseSource(`
      mcp filesystem { command: "npx" }
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent DataAnalyst { model: claude, tools: [filesystem.readFile] }
      x = 42
    `);
    const code = generateCodeForTest(statements);
    expect(code).toContain('// Initialize MCP servers using LlamaIndex');
    expect(code).toContain('// Initialize model configurations');
    expect(code).toContain('// Initialize agent configurations');
    expect(code).toContain('__llamaindex_mcp');
    expect(code).toContain('const __models = {}');
    expect(code).toContain('const DataAnalyst = new __Agent({');
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
    const code = generateCodeForTest(statements);
    expect(code).toContain(
      'tools: [filesystem.readFile, filesystem.writeFile, filesystem.listFiles]'
    );
  });

  it('should handle agent without tools', () => {
    const statements = parseSource(`
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent SimpleAgent { model: claude, description: "No tools" }
    `);
    const code = generateCodeForTest(statements);
    expect(code).toContain('const SimpleAgent = new __Agent({');
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
    const code = generateCodeForTest(statements);

    // Models should be initialized before agents
    const modelIndex = code.indexOf('// Initialize model configurations');
    const agentIndex = code.indexOf('// Initialize agent configurations');
    expect(modelIndex).toBeLessThan(agentIndex);

    // Both agents should be present
    expect(code).toContain('const FirstAgent = new __Agent({');
    expect(code).toContain('const SecondAgent = new __Agent({');
  });

  it('should generate agent with user-defined tools', () => {
    const statements = parseSource(`
      tool analyzeData(input) {
        return input + " analyzed"
      }
      
      tool formatReport(content) {
        return "Report: " + content
      }
      
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent DataAnalyst { 
        model: claude, 
        tools: [analyzeData, formatReport] 
      }
    `);
    const code = generateCodeForTest(statements);

    // Tools should be declared with __createUserTool
    expect(code).toContain('__createUserTool("analyzeData"');
    expect(code).toContain('__createUserTool("formatReport"');

    // Should pass tools directly to agent (Agent will wrap at runtime)
    expect(code).toContain('tools: [analyzeData, formatReport]');
  });

  it('should generate agent with mixed MCP and user-defined tools', () => {
    const statements = parseSource(`
      mcp filesystem { command: "npx", args: ["-y", "@modelcontextprotocol/server-filesystem"] }
      
      tool customTool(data) {
        return data
      }
      
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent MixedAgent { 
        model: claude, 
        tools: [filesystem.readFile, customTool, filesystem.writeFile] 
      }
    `);
    const code = generateCodeForTest(statements);

    // Should have both MCP tools and user tools
    expect(code).toContain('filesystem.readFile');
    expect(code).toContain('__createUserTool("customTool"');
    expect(code).toContain('filesystem.writeFile');
    expect(code).toContain(
      'tools: [filesystem.readFile, customTool, filesystem.writeFile]'
    );
  });

  it('should generate agent with user-defined tool and MCP server expansion', () => {
    const statements = parseSource(`
      mcp filesystem { command: "npx", args: ["-y", "@modelcontextprotocol/server-filesystem"] }
      
      tool analyzeFile(path) {
        return path
      }
      
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent FileAnalyst { 
        model: claude, 
        tools: [filesystem, analyzeFile] 
      }
    `);
    const code = generateCodeForTest(statements);

    // Should pass MCP server proxy (filesystem) and user tool directly
    // Agent will expand the MCP server proxy at runtime
    expect(code).toContain('__createUserTool("analyzeFile"');
    expect(code).toContain('tools: [filesystem, analyzeFile]');
  });

  it('should handle agent with user-defined tool with multiple parameters', () => {
    const statements = parseSource(`
      tool calculate(a, b, c) {
        return a + b + c
      }
      
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent Calculator { 
        model: claude, 
        tools: [calculate] 
      }
    `);
    const code = generateCodeForTest(statements);

    expect(code).toContain('__createUserTool("calculate"');
    expect(code).toContain('tools: [calculate]');
  });

  it('should handle agent with user-defined tool with no parameters', () => {
    const statements = parseSource(`
      tool getTimestamp() {
        return 42
      }
      
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      agent TimestampAgent { 
        model: claude, 
        tools: [getTimestamp] 
      }
    `);
    const code = generateCodeForTest(statements);

    expect(code).toContain('__createUserTool("getTimestamp"');
    expect(code).toContain('tools: [getTimestamp]');
  });
});
