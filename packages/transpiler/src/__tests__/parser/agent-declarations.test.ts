// Parser tests for agent declarations
import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import {
  AgentDeclaration,
  StringLiteral,
  NumberLiteral,
  ArrayLiteral,
  Identifier,
} from '../../ast.js';

describe('Parser - Agent Declarations', () => {
  it('should parse simple agent declaration', () => {
    const statements = parseSource(
      'agent DataAnalyst { model: claude, description: "Analyzes data" }'
    );
    expect(statements).toHaveLength(1);
    const stmt = statements[0] as AgentDeclaration;
    expect(stmt.type).toBe('agent_declaration');
    expect(stmt.name).toBe('DataAnalyst');
    expect(stmt.config.type).toBe('object');
    expect(stmt.config.properties).toHaveLength(2);
    expect(stmt.config.properties[0].key).toBe('model');
    expect((stmt.config.properties[0].value as Identifier).name).toBe('claude');
    expect(stmt.config.properties[1].key).toBe('description');
    expect((stmt.config.properties[1].value as StringLiteral).value).toBe(
      'Analyzes data'
    );
  });

  it('should parse agent with systemPrompt', () => {
    const statements = parseSource(
      'agent CodeReviewer { model: gpt4, systemPrompt: "You are a code reviewer" }'
    );
    expect(statements).toHaveLength(1);
    const stmt = statements[0] as AgentDeclaration;
    expect(stmt.type).toBe('agent_declaration');
    expect(stmt.name).toBe('CodeReviewer');
    expect(stmt.config.properties).toHaveLength(2);
    expect(stmt.config.properties[1].key).toBe('systemPrompt');
    expect((stmt.config.properties[1].value as StringLiteral).value).toBe(
      'You are a code reviewer'
    );
  });

  it('should parse agent with tools array', () => {
    const statements = parseSource(
      'agent FileAgent { model: claude, tools: [filesystem.readFile, filesystem.writeFile] }'
    );
    expect(statements).toHaveLength(1);
    const stmt = statements[0] as AgentDeclaration;
    expect(stmt.config.properties).toHaveLength(2);
    expect(stmt.config.properties[1].key).toBe('tools');
    const toolsArray = stmt.config.properties[1].value as ArrayLiteral;
    expect(toolsArray.type).toBe('array');
    expect(toolsArray.elements).toHaveLength(2);
    // Tools are member expressions (filesystem.readFile)
    expect(toolsArray.elements[0].type).toBe('member');
    expect(toolsArray.elements[1].type).toBe('member');
  });

  it('should parse agent with temperature override', () => {
    const statements = parseSource(
      'agent CreativeWriter { model: gpt4, temperature: 0.9 }'
    );
    expect(statements).toHaveLength(1);
    const stmt = statements[0] as AgentDeclaration;
    expect(stmt.config.properties).toHaveLength(2);
    expect(stmt.config.properties[1].key).toBe('temperature');
    expect((stmt.config.properties[1].value as NumberLiteral).value).toBe(0.9);
  });

  it('should parse agent with maxTokens override', () => {
    const statements = parseSource(
      'agent LongFormWriter { model: gpt4, maxTokens: 10000 }'
    );
    expect(statements).toHaveLength(1);
    const stmt = statements[0] as AgentDeclaration;
    expect(stmt.config.properties).toHaveLength(2);
    expect(stmt.config.properties[1].key).toBe('maxTokens');
    expect((stmt.config.properties[1].value as NumberLiteral).value).toBe(
      10000
    );
  });

  it('should parse empty agent declaration', () => {
    const statements = parseSource('agent Simple { model: gpt4 }');
    expect(statements).toHaveLength(1);
    const stmt = statements[0] as AgentDeclaration;
    expect(stmt.type).toBe('agent_declaration');
    expect(stmt.name).toBe('Simple');
    expect(stmt.config.properties).toHaveLength(1);
  });

  it('should parse agent with all parameters', () => {
    const statements = parseSource(
      'agent CompleteAgent { model: claude, description: "Full config", systemPrompt: "You are helpful", tools: [filesystem.readFile], temperature: 0.7, maxTokens: 4000 }'
    );
    expect(statements).toHaveLength(1);
    const stmt = statements[0] as AgentDeclaration;
    expect(stmt.name).toBe('CompleteAgent');
    expect(stmt.config.properties).toHaveLength(6);
  });

  it('should parse multiple agent declarations', () => {
    const statements = parseSource(`
      agent ResearchAgent { model: claude }
      agent WriteAgent { model: gpt4 }
      agent ReviewAgent { model: gpt4 }
    `);
    expect(statements).toHaveLength(3);
    expect((statements[0] as AgentDeclaration).name).toBe('ResearchAgent');
    expect((statements[1] as AgentDeclaration).name).toBe('WriteAgent');
    expect((statements[2] as AgentDeclaration).name).toBe('ReviewAgent');
  });

  it('should parse agent mixed with model and mcp declarations', () => {
    const statements = parseSource(`
      mcp filesystem { command: "npx" }
      model claude { provider: "anthropic" }
      agent DataAnalyst { model: claude, tools: [filesystem.readFile] }
    `);
    expect(statements).toHaveLength(3);
    expect(statements[0].type).toBe('mcp_declaration');
    expect(statements[1].type).toBe('model_declaration');
    expect(statements[2].type).toBe('agent_declaration');
    expect((statements[2] as AgentDeclaration).name).toBe('DataAnalyst');
  });
});
