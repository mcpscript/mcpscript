// Codegen tests for model declarations
import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import { generateCode } from '../../codegen.js';

describe('Codegen - Model Declarations', () => {
  it('should generate LlamaIndex-compatible OpenAI model', () => {
    const statements = parseSource(
      'model gpt4 { provider: "openai", model: "gpt-4o", apiKey: env.OPENAI_API_KEY }'
    );
    const code = generateCode(statements);
    expect(code).toContain('// Initialize model configurations');
    expect(code).toContain('const __models = {};');
    expect(code).toContain('// Model configuration for gpt4');
    expect(code).toContain('new __llamaindex_OpenAI');
    expect(code).toContain('apiKey: process.env.OPENAI_API_KEY');
    expect(code).toContain('model: "gpt-4o"');
    expect(code).toContain('__models.gpt4 = gpt4;');
  });

  it('should generate LlamaIndex-compatible Anthropic model', () => {
    const statements = parseSource(
      'model claude { provider: "anthropic", model: "claude-3-opus-20240229", apiKey: env.ANTHROPIC_API_KEY }'
    );
    const code = generateCode(statements);
    expect(code).toContain('// Model configuration for claude');
    expect(code).toContain('new __llamaindex_Anthropic');
    expect(code).toContain('apiKey: process.env.ANTHROPIC_API_KEY');
    expect(code).toContain('model: "claude-3-opus-20240229"');
    expect(code).toContain('__models.claude = claude;');
  });

  it('should generate LlamaIndex-compatible Gemini model', () => {
    const statements = parseSource(
      'model gemini { provider: "gemini", model: "gemini-2.0-flash", apiKey: env.GOOGLE_API_KEY }'
    );
    const code = generateCode(statements);
    expect(code).toContain('// Model configuration for gemini');
    expect(code).toContain('new __llamaindex_Gemini');
    expect(code).toContain('apiKey: process.env.GOOGLE_API_KEY');
    expect(code).toContain('model: "gemini-2.0-flash"');
    expect(code).toContain('__models.gemini = gemini;');
  });

  it('should generate LlamaIndex-compatible Ollama model', () => {
    const statements = parseSource(
      'model local { provider: "ollama", model: "mixtral:8x7b" }'
    );
    const code = generateCode(statements);
    expect(code).toContain('// Model configuration for local');
    expect(code).toContain('new __llamaindex_Ollama');
    expect(code).toContain('model: "mixtral:8x7b"');
    expect(code).toContain('__models.local = local;');
  });

  it('should generate model with temperature and maxTokens', () => {
    const statements = parseSource(
      'model gpt4 { provider: "openai", model: "gpt-4o", temperature: 0.7, maxTokens: 4000 }'
    );
    const code = generateCode(statements);
    expect(code).toContain('temperature: 0.7');
    expect(code).toContain('maxTokens: 4000');
  });

  it('should throw error for model without provider', () => {
    const statements = parseSource('model invalid { model: "gpt-4" }');
    expect(() => generateCode(statements)).toThrow(
      'Model "invalid" must specify a provider'
    );
  });

  it('should throw error for unsupported provider', () => {
    const statements = parseSource(
      'model invalid { provider: "unsupported", model: "test" }'
    );
    expect(() => generateCode(statements)).toThrow(
      'Unsupported model provider: unsupported'
    );
  });

  it('should generate code for multiple model declarations with different providers', () => {
    const statements = parseSource(`
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      model gpt4 { provider: "openai", model: "gpt-4o" }
      model local { provider: "ollama", model: "llama2" }
    `);
    const code = generateCode(statements);
    expect(code).toContain('new __llamaindex_Anthropic');
    expect(code).toContain('new __llamaindex_OpenAI');
    expect(code).toContain('new __llamaindex_Ollama');
  });

  it('should not include model declarations in main code section', () => {
    const statements = parseSource(`
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      x = 42
    `);
    const code = generateCode(statements);
    expect(code).toContain('// Initialize model configurations');
    expect(code).toContain('// Generated code');
    expect(code).toContain('let x = 42;');
    const mainCodeSection = code.split('// Generated code')[1];
    expect(mainCodeSection).not.toContain('model claude');
  });

  it('should handle models mixed with MCP declarations', () => {
    const statements = parseSource(`
      mcp filesystem { command: "npx" }
      model claude { provider: "anthropic", model: "claude-3-opus-20240229" }
      x = 42
    `);
    const code = generateCode(statements);
    expect(code).toContain('// Initialize MCP servers using LlamaIndex');
    expect(code).toContain('// Initialize model configurations');
    expect(code).toContain('__llamaindex_mcp');
    expect(code).toContain('const __models = {}');
    expect(code).toContain('// Generated code');
    expect(code).toContain('let x = 42;');
  });

  it('should handle OpenAI with all parameters', () => {
    const statements = parseSource(
      'model custom { provider: "openai", model: "gpt-4", temperature: 0.5, maxTokens: 2000 }'
    );
    const code = generateCode(statements);
    expect(code).toContain('model: "gpt-4"');
    expect(code).toContain('temperature: 0.5');
    expect(code).toContain('maxTokens: 2000');
  });

  it('should handle Ollama model with temperature', () => {
    const statements = parseSource(
      'model local { provider: "ollama", model: "llama2", temperature: 0.8 }'
    );
    const code = generateCode(statements);
    expect(code).toContain('model: "llama2"');
    expect(code).toContain('temperature: 0.8');
  });

  it('should convert env member expressions to process.env', () => {
    const statements = parseSource(
      'model gpt4 { provider: "openai", apiKey: env.OPENAI_API_KEY }'
    );
    const code = generateCode(statements);
    expect(code).toContain('process.env.OPENAI_API_KEY');
  });
});
