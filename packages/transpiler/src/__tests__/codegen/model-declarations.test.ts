// Codegen tests for model declarations
import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import { generateCode } from '../../codegen.js';

describe('Codegen - Model Declarations', () => {
  it('should generate code for simple model declaration', () => {
    const statements = parseSource(
      'model claude { provider: "anthropic", model: "claude-3-opus-20240229" }'
    );
    const code = generateCode(statements);
    expect(code).toContain('// Initialize model configurations');
    expect(code).toContain('const __models = {};');
    expect(code).toContain('// Model configuration for claude');
    expect(code).toContain(
      'const claude = {provider: "anthropic", model: "claude-3-opus-20240229"};'
    );
    expect(code).toContain('__models.claude = claude;');
  });

  it('should generate code for model with environment variable', () => {
    const statements = parseSource(
      'model gpt4 { provider: "openai", apiKey: env.OPENAI_API_KEY }'
    );
    const code = generateCode(statements);
    expect(code).toContain('// Model configuration for gpt4');
    // Environment variable member expressions are converted to their identifier name
    expect(code).toContain(
      'const gpt4 = {provider: "openai", apiKey: undefined}'
    );
    expect(code).toContain('__models.gpt4 = gpt4;');
  });

  it('should generate code for model with numeric parameters', () => {
    const statements = parseSource(
      'model claude { temperature: 0.7, maxTokens: 4000 }'
    );
    const code = generateCode(statements);
    expect(code).toContain('temperature: 0.7, maxTokens: 4000');
  });

  it('should generate code for empty model declaration', () => {
    const statements = parseSource('model simple {}');
    const code = generateCode(statements);
    expect(code).toContain('const simple = {};');
    expect(code).toContain('__models.simple = simple;');
  });

  it('should generate code for model with nested object', () => {
    const statements = parseSource(
      'model custom { headers: { Authorization: "Bearer token" } }'
    );
    const code = generateCode(statements);
    expect(code).toContain('headers: {Authorization: "Bearer token"}');
  });

  it('should generate code for multiple model declarations', () => {
    const statements = parseSource(`
      model claude { provider: "anthropic" }
      model gpt4 { provider: "openai" }
    `);
    const code = generateCode(statements);
    expect(code).toContain('const claude = {provider: "anthropic"};');
    expect(code).toContain('const gpt4 = {provider: "openai"};');
    expect(code).toContain('__models.claude = claude;');
    expect(code).toContain('__models.gpt4 = gpt4;');
  });

  it('should not include model declarations in main code section', () => {
    const statements = parseSource(`
      model claude { provider: "anthropic" }
      x = 42
    `);
    const code = generateCode(statements);
    // Model config should be in initialization section
    expect(code).toContain('// Initialize model configurations');
    // Main code should only have the assignment
    expect(code).toContain('// Generated code');
    expect(code).toContain('let x = 42;');
    // Model declaration shouldn't appear in main code
    const mainCodeSection = code.split('// Generated code')[1];
    expect(mainCodeSection).not.toContain('model claude');
  });

  it('should handle models mixed with MCP declarations', () => {
    const statements = parseSource(`
      mcp filesystem { command: "npx" }
      model claude { provider: "anthropic" }
      x = 42
    `);
    const code = generateCode(statements);
    expect(code).toContain('// Initialize MCP clients');
    expect(code).toContain('// Initialize model configurations');
    expect(code).toContain('const __mcpClients = {};');
    expect(code).toContain('const __models = {};');
    expect(code).toContain('// Generated code');
    expect(code).toContain('let x = 42;');
  });

  it('should generate code for model with endpoint', () => {
    const statements = parseSource(
      'model local { endpoint: "localhost:11434" }'
    );
    const code = generateCode(statements);
    expect(code).toContain('endpoint: "localhost:11434"');
  });

  it('should generate code for comprehensive model configuration', () => {
    const statements = parseSource(
      'model fullConfig { provider: "anthropic", model: "claude-3-opus-20240229", temperature: 0.7, maxTokens: 4000, topP: 0.9 }'
    );
    const code = generateCode(statements);
    expect(code).toContain('provider: "anthropic"');
    expect(code).toContain('model: "claude-3-opus-20240229"');
    expect(code).toContain('temperature: 0.7');
    expect(code).toContain('maxTokens: 4000');
    expect(code).toContain('topP: 0.9');
  });
});
