// Parser tests for model declarations
import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import {
  ModelDeclaration,
  StringLiteral,
  NumberLiteral,
  MemberExpression,
  Identifier,
  ObjectLiteral,
} from '../../ast.js';

describe('Parser - Model Declarations', () => {
  it('should parse simple model declaration', () => {
    const statements = parseSource(
      'model claude { provider: "anthropic", model: "claude-3-opus-20240229" }'
    );
    expect(statements).toHaveLength(1);
    const stmt = statements[0] as ModelDeclaration;
    expect(stmt.type).toBe('model_declaration');
    expect(stmt.name).toBe('claude');
    expect(stmt.config.type).toBe('object');
    expect(stmt.config.properties).toHaveLength(2);
    expect(stmt.config.properties[0].key).toBe('provider');
    expect((stmt.config.properties[0].value as StringLiteral).value).toBe(
      'anthropic'
    );
    expect(stmt.config.properties[1].key).toBe('model');
    expect((stmt.config.properties[1].value as StringLiteral).value).toBe(
      'claude-3-opus-20240229'
    );
  });

  it('should parse model with environment variable', () => {
    const statements = parseSource(
      'model gpt4 { provider: "openai", apiKey: env.OPENAI_API_KEY }'
    );
    expect(statements).toHaveLength(1);
    const stmt = statements[0] as ModelDeclaration;
    expect(stmt.type).toBe('model_declaration');
    expect(stmt.name).toBe('gpt4');
    expect(stmt.config.properties).toHaveLength(2);
    expect(stmt.config.properties[1].key).toBe('apiKey');
    const memberExpr = stmt.config.properties[1].value as MemberExpression;
    expect(memberExpr.type).toBe('member');
    expect((memberExpr.object as Identifier).name).toBe('env');
    expect(memberExpr.property).toBe('OPENAI_API_KEY');
  });

  it('should parse model with numeric parameters', () => {
    const statements = parseSource(
      'model claude { temperature: 0.7, maxTokens: 4000 }'
    );
    expect(statements).toHaveLength(1);
    const stmt = statements[0] as ModelDeclaration;
    expect(stmt.config.properties).toHaveLength(2);
    expect(stmt.config.properties[0].key).toBe('temperature');
    expect((stmt.config.properties[0].value as NumberLiteral).value).toBe(0.7);
    expect(stmt.config.properties[1].key).toBe('maxTokens');
    expect((stmt.config.properties[1].value as NumberLiteral).value).toBe(4000);
  });

  it('should parse model with URL', () => {
    const statements = parseSource(
      'model localLlama { endpoint: "localhost:11434" }'
    );
    expect(statements).toHaveLength(1);
    const stmt = statements[0] as ModelDeclaration;
    expect(stmt.config.properties).toHaveLength(1);
    expect(stmt.config.properties[0].key).toBe('endpoint');
    expect((stmt.config.properties[0].value as StringLiteral).value).toBe(
      'localhost:11434'
    );
  });

  it('should parse empty model declaration', () => {
    const statements = parseSource('model simple {}');
    expect(statements).toHaveLength(1);
    const stmt = statements[0] as ModelDeclaration;
    expect(stmt.type).toBe('model_declaration');
    expect(stmt.name).toBe('simple');
    expect(stmt.config.properties).toHaveLength(0);
  });

  it('should parse model with nested object (headers)', () => {
    const statements = parseSource(
      'model custom { headers: { Authorization: "Bearer token" } }'
    );
    expect(statements).toHaveLength(1);
    const stmt = statements[0] as ModelDeclaration;
    expect(stmt.config.properties).toHaveLength(1);
    expect(stmt.config.properties[0].key).toBe('headers');
    const headers = stmt.config.properties[0].value as ObjectLiteral;
    expect(headers.type).toBe('object');
    expect(headers.properties).toHaveLength(1);
    expect(headers.properties[0].key).toBe('Authorization');
    expect((headers.properties[0].value as StringLiteral).value).toBe(
      'Bearer token'
    );
  });

  it('should parse multiple model declarations', () => {
    const statements = parseSource(`
      model claude { provider: "anthropic" }
      model gpt4 { provider: "openai" }
      model local { provider: "ollama" }
    `);
    expect(statements).toHaveLength(3);
    expect((statements[0] as ModelDeclaration).name).toBe('claude');
    expect((statements[1] as ModelDeclaration).name).toBe('gpt4');
    expect((statements[2] as ModelDeclaration).name).toBe('local');
  });

  it('should parse model declaration with all common parameters', () => {
    const statements = parseSource(
      'model fullConfig { provider: "anthropic", model: "claude-3-opus-20240229", apiKey: env.ANTHROPIC_API_KEY, temperature: 0.7, maxTokens: 4000 }'
    );
    expect(statements).toHaveLength(1);
    const stmt = statements[0] as ModelDeclaration;
    expect(stmt.name).toBe('fullConfig');
    expect(stmt.config.properties).toHaveLength(5);
  });
});
