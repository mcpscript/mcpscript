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

  it('should parse simple if-else statement', () => {
    const source = 'if (true) x = 1 else y = 2';
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

    expect(ifStmt.else).toBeDefined();
    const elseStmt = ifStmt.else as Assignment;
    expect(elseStmt.type).toBe('assignment');
    expect((elseStmt.target as Identifier).name).toBe('y');
    expect((elseStmt.value as NumberLiteral).value).toBe(2);
  });

  it('should parse if-else with block statements', () => {
    const source = `if (condition) {
      x = 10
      print(x)
    } else {
      y = 20
      print(y)
    }`;
    const statements = parseSource(source);

    expect(statements).toHaveLength(1);
    const ifStmt = statements[0] as IfStatement;

    expect(ifStmt.type).toBe('if_statement');
    expect(ifStmt.condition.type).toBe('identifier');

    const thenStmt = ifStmt.then as BlockStatement;
    expect(thenStmt.type).toBe('block_statement');
    expect(thenStmt.statements).toHaveLength(2);

    expect(ifStmt.else).toBeDefined();
    const elseStmt = ifStmt.else as BlockStatement;
    expect(elseStmt.type).toBe('block_statement');
    expect(elseStmt.statements).toHaveLength(2);
  });

  it('should parse if-else with mixed block and non-block statements', () => {
    const source = `if (x > 0) {
      result = "positive"
    } else result = "negative"`;
    const statements = parseSource(source);

    expect(statements).toHaveLength(1);
    const ifStmt = statements[0] as IfStatement;

    expect(ifStmt.type).toBe('if_statement');
    expect(ifStmt.then.type).toBe('block_statement');
    expect(ifStmt.else).toBeDefined();
    expect(ifStmt.else!.type).toBe('assignment');
  });

  it('should parse if-else if chain', () => {
    const source =
      'if (x > 0) result = "positive" else if (x < 0) result = "negative" else result = "zero"';
    const statements = parseSource(source);

    expect(statements).toHaveLength(1);
    const ifStmt = statements[0] as IfStatement;

    expect(ifStmt.type).toBe('if_statement');
    expect(ifStmt.condition.type).toBe('binary');

    const thenStmt = ifStmt.then as Assignment;
    expect(thenStmt.type).toBe('assignment');
    expect((thenStmt.value as StringLiteral).value).toBe('positive');

    expect(ifStmt.else).toBeDefined();
    const elseIfStmt = ifStmt.else as IfStatement;
    expect(elseIfStmt.type).toBe('if_statement');
    expect(elseIfStmt.condition.type).toBe('binary');

    const elseIfThenStmt = elseIfStmt.then as Assignment;
    expect(elseIfThenStmt.type).toBe('assignment');
    expect((elseIfThenStmt.value as StringLiteral).value).toBe('negative');

    expect(elseIfStmt.else).toBeDefined();
    const finalElseStmt = elseIfStmt.else as Assignment;
    expect(finalElseStmt.type).toBe('assignment');
    expect((finalElseStmt.value as StringLiteral).value).toBe('zero');
  });

  it('should parse nested if-else statements', () => {
    const source = 'if (outer) if (inner) a = 1 else a = 2 else b = 3';
    const statements = parseSource(source);

    expect(statements).toHaveLength(1);
    const outerIf = statements[0] as IfStatement;

    expect(outerIf.type).toBe('if_statement');
    expect((outerIf.condition as Identifier).name).toBe('outer');

    const innerIf = outerIf.then as IfStatement;
    expect(innerIf.type).toBe('if_statement');
    expect((innerIf.condition as Identifier).name).toBe('inner');

    expect(innerIf.then.type).toBe('assignment');
    expect(innerIf.else).toBeDefined();
    expect(innerIf.else!.type).toBe('assignment');

    expect(outerIf.else).toBeDefined();
    expect(outerIf.else!.type).toBe('assignment');
    expect(((outerIf.else as Assignment).target as Identifier).name).toBe('b');
  });

  it('should parse if-else with complex expressions', () => {
    const source =
      'if (x >= 0 && y < 100) status = "valid" else status = "invalid"';
    const statements = parseSource(source);

    expect(statements).toHaveLength(1);
    const ifStmt = statements[0] as IfStatement;

    expect(ifStmt.type).toBe('if_statement');
    expect(ifStmt.condition.type).toBe('binary');
    expect((ifStmt.condition as BinaryExpression).operator).toBe('&&');

    expect(ifStmt.then.type).toBe('assignment');
    expect(ifStmt.else).toBeDefined();
    expect(ifStmt.else!.type).toBe('assignment');
  });
});
