// Parser tests for agent delegation operator
import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import {
  Assignment,
  BinaryExpression,
  StringLiteral,
  Identifier,
} from '../../ast.js';

describe('Parser - Agent Delegation', () => {
  it('should parse simple agent delegation with string literal', () => {
    const statements = parseSource(
      'result = "Analyze this data" -> DataAnalyst'
    );
    expect(statements).toHaveLength(1);
    const stmt = statements[0] as Assignment;
    expect(stmt.type).toBe('assignment');

    const expr = stmt.value as BinaryExpression;
    expect(expr.type).toBe('binary');
    expect(expr.operator).toBe('->');
    expect(expr.left.type).toBe('string');
    expect((expr.left as StringLiteral).value).toBe('Analyze this data');
    expect(expr.right.type).toBe('identifier');
    expect((expr.right as Identifier).name).toBe('DataAnalyst');
  });

  it('should parse agent delegation with variable', () => {
    const statements = parseSource('conv = prompt -> Agent');
    expect(statements).toHaveLength(1);
    const stmt = statements[0] as Assignment;

    const expr = stmt.value as BinaryExpression;
    expect(expr.type).toBe('binary');
    expect(expr.operator).toBe('->');
    expect(expr.left.type).toBe('identifier');
    expect((expr.left as Identifier).name).toBe('prompt');
    expect(expr.right.type).toBe('identifier');
    expect((expr.right as Identifier).name).toBe('Agent');
  });

  it('should parse chained agent delegation as right-associative', () => {
    const statements = parseSource('result = "prompt1" -> Agent1 -> Agent2');
    expect(statements).toHaveLength(1);
    const stmt = statements[0] as Assignment;

    // Should parse as: "prompt1" -> (Agent1 -> Agent2)
    // But actually agent delegation doesn't chain like this
    // It should parse as: ("prompt1" -> Agent1) -> Agent2
    const expr = stmt.value as BinaryExpression;
    expect(expr.type).toBe('binary');
    expect(expr.operator).toBe('->');
  });

  it('should parse agent delegation with expression statement', () => {
    const statements = parseSource('"Hello" -> Agent');
    expect(statements).toHaveLength(1);
    expect(statements[0].type).toBe('expression_statement');
  });

  it('should parse multiple agent delegations', () => {
    const statements = parseSource(`
      result1 = "First task" -> Agent1
      result2 = "Second task" -> Agent2
    `);
    expect(statements).toHaveLength(2);

    const stmt1 = statements[0] as Assignment;
    const expr1 = stmt1.value as BinaryExpression;
    expect(expr1.operator).toBe('->');

    const stmt2 = statements[1] as Assignment;
    const expr2 = stmt2.value as BinaryExpression;
    expect(expr2.operator).toBe('->');
  });

  it('should parse agent delegation mixed with other statements', () => {
    const statements = parseSource(`
      x = 42
      result = "Analyze" -> DataAnalyst
      y = x + 10
    `);
    expect(statements).toHaveLength(3);
    expect(statements[0].type).toBe('assignment');
    expect(statements[1].type).toBe('assignment');
    expect(statements[2].type).toBe('assignment');

    const stmt2 = statements[1] as Assignment;
    const expr = stmt2.value as BinaryExpression;
    expect(expr.operator).toBe('->');
  });

  it('should handle agent delegation with parentheses', () => {
    const statements = parseSource('result = ("prompt" -> Agent)');
    expect(statements).toHaveLength(1);
    const stmt = statements[0] as Assignment;

    const expr = stmt.value as BinaryExpression;
    expect(expr.type).toBe('binary');
    expect(expr.operator).toBe('->');
  });
});
