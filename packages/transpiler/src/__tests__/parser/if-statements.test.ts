import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import type {
  IfStatement,
  Assignment,
  ExpressionStatement,
  BlockStatement,
  BooleanLiteral,
  NumberLiteral,
  StringLiteral,
  Identifier,
  BinaryExpression,
} from '../../ast.js';

describe('If Statement Parser', () => {
  it('should parse simple if statement with assignment', () => {
    const source = 'if (true) x = 1';
    const statements = parseSource(source);

    expect(statements).toHaveLength(1);
    const ifStmt = statements[0] as IfStatement;

    expect(ifStmt.type).toBe('if_statement');
    expect(ifStmt.condition.type).toBe('boolean');
    expect((ifStmt.condition as BooleanLiteral).value).toBe(true);

    const thenStmt = ifStmt.then as Assignment;
    expect(thenStmt.type).toBe('assignment');
    expect((thenStmt.target as Identifier).name).toBe('x');
    expect((thenStmt.value as NumberLiteral).value).toBe(1);
  });

  it('should parse if statement with expression statement', () => {
    const source = 'if (x > 0) print("positive")';
    const statements = parseSource(source);

    expect(statements).toHaveLength(1);
    const ifStmt = statements[0] as IfStatement;

    expect(ifStmt.type).toBe('if_statement');
    expect(ifStmt.condition.type).toBe('binary');

    const thenStmt = ifStmt.then as ExpressionStatement;
    expect(thenStmt.type).toBe('expression_statement');
    expect(thenStmt.expression.type).toBe('call');
  });

  it('should parse if statement with block statement', () => {
    const source = `if (enabled) {
      x = 10
      print(x)
    }`;
    const statements = parseSource(source);

    expect(statements).toHaveLength(1);
    const ifStmt = statements[0] as IfStatement;

    expect(ifStmt.type).toBe('if_statement');
    expect(ifStmt.condition.type).toBe('identifier');

    const thenStmt = ifStmt.then as BlockStatement;
    expect(thenStmt.type).toBe('block_statement');
    expect(thenStmt.statements).toHaveLength(2);
  });

  it('should parse nested if statements', () => {
    const source = 'if (x > 0) if (y > 0) result = "positive"';
    const statements = parseSource(source);

    expect(statements).toHaveLength(1);
    const outerIf = statements[0] as IfStatement;

    expect(outerIf.type).toBe('if_statement');

    const innerIf = outerIf.then as IfStatement;
    expect(innerIf.type).toBe('if_statement');

    const assignment = innerIf.then as Assignment;
    expect(assignment.type).toBe('assignment');
    expect((assignment.value as StringLiteral).value).toBe('positive');
  });

  it('should parse complex condition with logical operators', () => {
    const source = 'if (x >= 0 && y < 100) status = "valid"';
    const statements = parseSource(source);

    expect(statements).toHaveLength(1);
    const ifStmt = statements[0] as IfStatement;

    expect(ifStmt.type).toBe('if_statement');
    expect(ifStmt.condition.type).toBe('binary');
    expect((ifStmt.condition as BinaryExpression).operator).toBe('&&');
  });

  it('should parse if with parenthesized condition', () => {
    const source = 'if ((x + y) > 10) result = true';
    const statements = parseSource(source);

    expect(statements).toHaveLength(1);
    const ifStmt = statements[0] as IfStatement;

    expect(ifStmt.type).toBe('if_statement');
    expect(ifStmt.condition.type).toBe('binary');
  });

  it('should parse if with member expression condition', () => {
    const source = 'if (obj.enabled) obj.count = 5';
    const statements = parseSource(source);

    expect(statements).toHaveLength(1);
    const ifStmt = statements[0] as IfStatement;

    expect(ifStmt.type).toBe('if_statement');
    expect(ifStmt.condition.type).toBe('member');
  });

  it('should parse if with function call condition', () => {
    const source = 'if (isValid()) proceed()';
    const statements = parseSource(source);

    expect(statements).toHaveLength(1);
    const ifStmt = statements[0] as IfStatement;

    expect(ifStmt.type).toBe('if_statement');
    expect(ifStmt.condition.type).toBe('call');

    const thenStmt = ifStmt.then as ExpressionStatement;
    expect(thenStmt.expression.type).toBe('call');
  });
});
