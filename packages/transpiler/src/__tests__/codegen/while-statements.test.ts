import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import { generateCode } from '../../codegen.js';

describe('While Statement Code Generation', () => {
  it('generates simple while statement', () => {
    const source = 'while (true) x = 1';
    const statements = parseSource(source);
    const code = generateCode(statements);

    expect(code).toContain('while (true) {');
    expect(code).toContain('let x = 1;');
  });

  it('generates while statement with expression condition', () => {
    const source = 'while (x > 0) print("running")';
    const statements = parseSource(source);
    const code = generateCode(statements);

    expect(code).toContain('while (x > 0) {');
    expect(code).toContain('print("running");');
  });

  it('generates while statement with block body', () => {
    const source = `while (count < 5) {
  print(count)
  count = count + 1
}`;
    const statements = parseSource(source);
    const code = generateCode(statements);

    expect(code).toContain('while (count < 5) {');
    expect(code).toContain('print(count);');
    expect(code).toContain('count = count + 1;');
  });

  it('generates while statement with complex logical condition', () => {
    const source = 'while (x >= 0 && y < 100) process()';
    const statements = parseSource(source);
    const code = generateCode(statements);

    expect(code).toContain('while (x >= 0 && y < 100) {');
    expect(code).toContain('process();');
  });

  it('handles variable declarations in while loop body', () => {
    const source = `x = 0
while (x < 3) {
  y = x * 2
  x = x + 1
}`;
    const statements = parseSource(source);
    const code = generateCode(statements);

    expect(code).toContain('let x = 0;');
    expect(code).toContain('while (x < 3) {');
    expect(code).toContain('let y = x * 2;');
    expect(code).toContain('x = x + 1;');
  });

  it('generates nested while statements correctly', () => {
    const source = `while (x > 0) {
  while (y > 0) {
    y = y - 1
  }
  x = x - 1
}`;
    const statements = parseSource(source);
    const code = generateCode(statements);

    expect(code).toContain('while (x > 0) {');
    expect(code).toContain('while (y > 0) {');
    expect(code).toContain('y = y - 1;');
    expect(code).toContain('x = x - 1;');
  });

  it('properly indents nested while statements', () => {
    const source = `while (x > 0) {
  while (y > 0) y = y - 1
  x = x - 1
}`;
    const statements = parseSource(source);
    const code = generateCode(statements);

    // Check that the nested while is properly indented
    const lines = code.split('\n');
    const innerWhileLine = lines.find(line => line.includes('while (y > 0)'));
    expect(innerWhileLine).toBeTruthy();
    expect(innerWhileLine?.startsWith('  ')).toBe(true);
  });
});
