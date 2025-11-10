// Parser tests for for statements
import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import {
  ForStatement,
  Identifier,
  NumberLiteral,
  BinaryExpression,
  BlockStatement,
} from '../../ast.js';

describe('Parser - For Statements', () => {
  it('should parse basic for loop with all parts', () => {
    const statements = parseSource(
      'for (i = 0; i < 10; i = i + 1) { print(i) }'
    );
    expect(statements).toHaveLength(1);

    const stmt = statements[0] as ForStatement;
    expect(stmt.type).toBe('for_statement');

    // Check init
    expect(stmt.init).toBeDefined();
    expect(stmt.init!.type).toBe('assignment');
    expect((stmt.init!.target as Identifier).name).toBe('i');
    expect((stmt.init!.value as NumberLiteral).value).toBe(0);

    // Check condition
    expect(stmt.condition).toBeDefined();
    expect(stmt.condition!.type).toBe('binary');
    const condition = stmt.condition as BinaryExpression;
    expect((condition.left as Identifier).name).toBe('i');
    expect(condition.operator).toBe('<');
    expect((condition.right as NumberLiteral).value).toBe(10);

    // Check update
    expect(stmt.update).toBeDefined();
    expect(stmt.update!.type).toBe('assignment');
    expect((stmt.update!.target as Identifier).name).toBe('i');
    const updateValue = stmt.update!.value as BinaryExpression;
    expect(updateValue.type).toBe('binary');
    expect((updateValue.left as Identifier).name).toBe('i');
    expect(updateValue.operator).toBe('+');
    expect((updateValue.right as NumberLiteral).value).toBe(1);

    // Check body
    expect(stmt.body.type).toBe('block_statement');
    const body = stmt.body as BlockStatement;
    expect(body.statements).toHaveLength(1);
  });

  it('should parse for loop with empty init', () => {
    const statements = parseSource('for (; i < 10; i = i + 1) { print(i) }');
    expect(statements).toHaveLength(1);

    const stmt = statements[0] as ForStatement;
    expect(stmt.type).toBe('for_statement');
    expect(stmt.init).toBeUndefined();
    expect(stmt.condition).toBeDefined();
    expect(stmt.update).toBeDefined();
  });

  it('should parse for loop with empty condition', () => {
    const statements = parseSource('for (i = 0; ; i = i + 1) { print(i) }');
    expect(statements).toHaveLength(1);

    const stmt = statements[0] as ForStatement;
    expect(stmt.type).toBe('for_statement');
    expect(stmt.init).toBeDefined();
    expect(stmt.condition).toBeUndefined();
    expect(stmt.update).toBeDefined();
  });

  it('should parse for loop with empty update', () => {
    const statements = parseSource('for (i = 0; i < 10; ) { print(i) }');
    expect(statements).toHaveLength(1);

    const stmt = statements[0] as ForStatement;
    expect(stmt.type).toBe('for_statement');
    expect(stmt.init).toBeDefined();
    expect(stmt.condition).toBeDefined();
    expect(stmt.update).toBeUndefined();
  });

  it('should parse for loop with all parts empty', () => {
    const statements = parseSource('for (;;) { print("infinite") }');
    expect(statements).toHaveLength(1);

    const stmt = statements[0] as ForStatement;
    expect(stmt.type).toBe('for_statement');
    expect(stmt.init).toBeUndefined();
    expect(stmt.condition).toBeUndefined();
    expect(stmt.update).toBeUndefined();
    expect(stmt.body.type).toBe('block_statement');
  });

  it('should parse for loop with single statement body', () => {
    const statements = parseSource('for (i = 0; i < 5; i = i + 1) print(i)');
    expect(statements).toHaveLength(1);

    const stmt = statements[0] as ForStatement;
    expect(stmt.type).toBe('for_statement');
    expect(stmt.body.type).toBe('expression_statement');
  });

  it('should parse nested for loops', () => {
    const statements = parseSource(`
      for (i = 0; i < 3; i = i + 1) {
        for (j = 0; j < 3; j = j + 1) {
          print(i + j)
        }
      }
    `);
    expect(statements).toHaveLength(1);

    const outerStmt = statements[0] as ForStatement;
    expect(outerStmt.type).toBe('for_statement');

    const outerBody = outerStmt.body as BlockStatement;
    expect(outerBody.statements).toHaveLength(1);

    const innerStmt = outerBody.statements[0] as ForStatement;
    expect(innerStmt.type).toBe('for_statement');
    expect((innerStmt.init!.target as Identifier).name).toBe('j');
  });

  it('should parse for loop with complex expressions', () => {
    const statements = parseSource(
      'for (x = 2 * 5; x > 0 && x < 100; x = x - 1) { result = x * 2 }'
    );
    expect(statements).toHaveLength(1);

    const stmt = statements[0] as ForStatement;
    expect(stmt.type).toBe('for_statement');

    // Check complex init
    const initValue = stmt.init!.value as BinaryExpression;
    expect(initValue.type).toBe('binary');
    expect(initValue.operator).toBe('*');

    // Check complex condition
    const condition = stmt.condition as BinaryExpression;
    expect(condition.type).toBe('binary');
    expect(condition.operator).toBe('&&');
  });
});
