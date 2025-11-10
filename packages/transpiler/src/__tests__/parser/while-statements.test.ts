import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import { WhileStatement } from '../../ast.js';

describe('While Statement Parser', () => {
  it('parses simple while statement', () => {
    const source = 'while (true) x = 1';
    const statements = parseSource(source);

    expect(statements).toHaveLength(1);
    const stmt = statements[0] as WhileStatement;
    expect(stmt.type).toBe('while_statement');
    expect(stmt.condition.type).toBe('boolean');
    expect(stmt.body.type).toBe('assignment');
  });

  it('parses while statement with expression condition', () => {
    const source = 'while (x > 0) print("running")';
    const statements = parseSource(source);

    expect(statements).toHaveLength(1);
    const stmt = statements[0] as WhileStatement;
    expect(stmt.type).toBe('while_statement');
    expect(stmt.condition.type).toBe('binary');
    expect(stmt.body.type).toBe('expression_statement');
  });

  it('parses while statement with block body', () => {
    const source = `while (count < 5) {
  print(count)
  count = count + 1
}`;
    const statements = parseSource(source);

    expect(statements).toHaveLength(1);
    const stmt = statements[0] as WhileStatement;
    expect(stmt.type).toBe('while_statement');
    expect(stmt.condition.type).toBe('binary');
    expect(stmt.body.type).toBe('block_statement');
  });

  it('parses while statement with complex logical condition', () => {
    const source = 'while (x >= 0 && y < 100) process()';
    const statements = parseSource(source);

    expect(statements).toHaveLength(1);
    const stmt = statements[0] as WhileStatement;
    expect(stmt.type).toBe('while_statement');
    expect(stmt.condition.type).toBe('binary');
    expect(stmt.body.type).toBe('expression_statement');
  });

  it('parses nested while statements', () => {
    const source = `while (x > 0) {
  while (y > 0) {
    y = y - 1
  }
  x = x - 1
}`;
    const statements = parseSource(source);

    expect(statements).toHaveLength(1);
    const stmt = statements[0] as WhileStatement;
    expect(stmt.type).toBe('while_statement');
    expect(stmt.body.type).toBe('block_statement');
  });
});
