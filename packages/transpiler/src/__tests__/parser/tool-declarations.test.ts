import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import { ToolDeclaration, ReturnStatement } from '../../ast.js';

describe('Parser - Tool Declarations', () => {
  it('should parse a simple tool declaration with no parameters', () => {
    const source = `
      tool myTool() {
        x = 5
      }
    `;
    const statements = parseSource(source);
    expect(statements).toHaveLength(1);
    expect(statements[0].type).toBe('tool_declaration');

    const tool = statements[0] as ToolDeclaration;
    expect(tool.name).toBe('myTool');
    expect(tool.parameters).toEqual([]);
    expect(tool.body.type).toBe('block_statement');
    expect(tool.body.statements).toHaveLength(1);
  });

  it('should parse a tool declaration with one parameter', () => {
    const source = `
      tool processData(input) {
        return input
      }
    `;
    const statements = parseSource(source);
    expect(statements).toHaveLength(1);

    const tool = statements[0] as ToolDeclaration;
    expect(tool.name).toBe('processData');
    expect(tool.parameters).toEqual(['input']);
  });

  it('should parse a tool declaration with multiple parameters', () => {
    const source = `
      tool calculateScore(points, multiplier, bonus) {
        result = points * multiplier + bonus
        return result
      }
    `;
    const statements = parseSource(source);
    expect(statements).toHaveLength(1);

    const tool = statements[0] as ToolDeclaration;
    expect(tool.name).toBe('calculateScore');
    expect(tool.parameters).toEqual(['points', 'multiplier', 'bonus']);
    expect(tool.body.statements).toHaveLength(2);
  });

  it('should parse a tool with trailing comma in parameters', () => {
    const source = `
      tool myTool(a, b, c,) {
        return a + b + c
      }
    `;
    const statements = parseSource(source);
    expect(statements).toHaveLength(1);

    const tool = statements[0] as ToolDeclaration;
    expect(tool.name).toBe('myTool');
    expect(tool.parameters).toEqual(['a', 'b', 'c']);
  });

  it('should parse a tool with return statement', () => {
    const source = `
      tool getValue() {
        return 42
      }
    `;
    const statements = parseSource(source);
    const tool = statements[0] as ToolDeclaration;
    expect(tool.body.statements).toHaveLength(1);
    expect(tool.body.statements[0].type).toBe('return_statement');

    const returnStmt = tool.body.statements[0] as ReturnStatement;
    expect(returnStmt.value).toBeDefined();
    expect(returnStmt.value?.type).toBe('number');
  });

  it('should parse a tool with return statement without value', () => {
    const source = `
      tool earlyExit() {
        return
      }
    `;
    const statements = parseSource(source);
    const tool = statements[0] as ToolDeclaration;
    expect(tool.body.statements).toHaveLength(1);

    const returnStmt = tool.body.statements[0] as ReturnStatement;
    expect(returnStmt.value).toBeUndefined();
  });

  it('should parse a tool with complex logic', () => {
    const source = `
      tool analyzeData(data, threshold) {
        if (data > threshold) {
          return true
        } else {
          return false
        }
      }
    `;
    const statements = parseSource(source);
    expect(statements).toHaveLength(1);

    const tool = statements[0] as ToolDeclaration;
    expect(tool.name).toBe('analyzeData');
    expect(tool.parameters).toEqual(['data', 'threshold']);
    expect(tool.body.statements).toHaveLength(1);
    expect(tool.body.statements[0].type).toBe('if_statement');
  });

  it('should parse multiple tool declarations', () => {
    const source = `
      tool first(a) {
        return a * 2
      }

      tool second(b, c) {
        return b + c
      }
    `;
    const statements = parseSource(source);
    expect(statements).toHaveLength(2);
    expect(statements[0].type).toBe('tool_declaration');
    expect(statements[1].type).toBe('tool_declaration');

    const tool1 = statements[0] as ToolDeclaration;
    const tool2 = statements[1] as ToolDeclaration;

    expect(tool1.name).toBe('first');
    expect(tool2.name).toBe('second');
  });

  it('should parse a tool that calls other functions', () => {
    const source = `
      tool processFile(path) {
        content = filesystem.readFile(path)
        parsed = JSON.parse(content)
        return parsed
      }
    `;
    const statements = parseSource(source);
    const tool = statements[0] as ToolDeclaration;
    expect(tool.body.statements).toHaveLength(3);
  });

  it('should parse a tool with loops', () => {
    const source = `
      tool sumArray(items) {
        total = 0
        for (i = 0; i < items.length; i = i + 1) {
          total = total + items[i]
        }
        return total
      }
    `;
    const statements = parseSource(source);
    const tool = statements[0] as ToolDeclaration;
    expect(tool.body.statements).toHaveLength(3);
  });
});
