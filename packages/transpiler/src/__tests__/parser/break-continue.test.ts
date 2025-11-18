import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import {
  WhileStatement,
  ForStatement,
  IfStatement,
  BlockStatement,
} from '../../ast.js';

describe('Break and Continue Statement Parsing', () => {
  it('should parse break statement', () => {
    const source = 'break';
    const statements = parseSource(source);

    expect(statements).toHaveLength(1);
    expect(statements[0]).toEqual({
      type: 'break_statement',
    });
  });

  it('should parse continue statement', () => {
    const source = 'continue';
    const statements = parseSource(source);

    expect(statements).toHaveLength(1);
    expect(statements[0]).toEqual({
      type: 'continue_statement',
    });
  });

  it('should parse break in while loop', () => {
    const source = `while (true) {
      if (condition) break
      x = x + 1
    }`;
    const statements = parseSource(source);

    expect(statements).toHaveLength(1);
    expect(statements[0].type).toBe('while_statement');

    const whileStmt = statements[0] as WhileStatement;
    const whileBody = whileStmt.body as BlockStatement;
    expect(whileBody.type).toBe('block_statement');
    expect(whileBody.statements).toHaveLength(2);

    const ifStmt = whileBody.statements[0] as IfStatement;
    expect(ifStmt.type).toBe('if_statement');
    expect(ifStmt.then.type).toBe('break_statement');
  });

  it('should parse continue in for loop', () => {
    const source = `for (i = 0; i < 10; i = i + 1) {
      if (i % 2 == 0) continue
      print(i)
    }`;
    const statements = parseSource(source);

    expect(statements).toHaveLength(1);
    expect(statements[0].type).toBe('for_statement');

    const forStmt = statements[0] as ForStatement;
    const forBody = forStmt.body as BlockStatement;
    expect(forBody.type).toBe('block_statement');
    expect(forBody.statements).toHaveLength(2);

    const ifStmt = forBody.statements[0] as IfStatement;
    expect(ifStmt.type).toBe('if_statement');
    expect(ifStmt.then.type).toBe('continue_statement');
  });

  it('should parse multiple break and continue statements', () => {
    const source = `while (running) {
      if (error) break
      if (skip) continue
      process()
    }`;
    const statements = parseSource(source);

    expect(statements).toHaveLength(1);
    expect(statements[0].type).toBe('while_statement');

    const whileStmt = statements[0] as WhileStatement;
    const whileBody = whileStmt.body as BlockStatement;
    expect(whileBody.statements).toHaveLength(3);

    const firstIf = whileBody.statements[0] as IfStatement;
    const secondIf = whileBody.statements[1] as IfStatement;
    expect(firstIf.then.type).toBe('break_statement');
    expect(secondIf.then.type).toBe('continue_statement');
  });
});
