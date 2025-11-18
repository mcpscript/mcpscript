import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import { generateCodeForTest } from '../test-helpers.js';

describe('Break and Continue Statement Codegen', () => {
  it('should generate break statement', () => {
    const source = 'break';
    const statements = parseSource(source);
    const code = generateCodeForTest(statements);

    expect(code).toContain('break;');
  });

  it('should generate continue statement', () => {
    const source = 'continue';
    const statements = parseSource(source);
    const code = generateCodeForTest(statements);

    expect(code).toContain('continue;');
  });

  it('should generate break in while loop', () => {
    const source = `while (true) {
      if (condition) break
      x = x + 1
    }`;
    const statements = parseSource(source);
    const code = generateCodeForTest(statements);

    expect(code).toContain('while (true) {');
    expect(code).toContain('if (condition) {');
    expect(code).toContain('break;');
    expect(code).toContain('x = x + 1;');
  });

  it('should generate continue in for loop', () => {
    const source = `for (i = 0; i < 10; i = i + 1) {
      if (i % 2 == 0) continue
      print(i)
    }`;
    const statements = parseSource(source);
    const code = generateCodeForTest(statements);

    expect(code).toContain('for (let i = 0; i < 10; i = i + 1) {');
    expect(code).toContain('if (i % 2 == 0) {');
    expect(code).toContain('continue;');
    expect(code).toContain('await print(i);');
  });

  it('should generate nested loops with break and continue', () => {
    const source = `while (outer) {
      for (i = 0; i < 5; i = i + 1) {
        if (i == 2) continue
        if (i == 4) break
        print(i)
      }
      if (done) break
    }`;
    const statements = parseSource(source);
    const code = generateCodeForTest(statements);

    expect(code).toContain('while (outer) {');
    expect(code).toContain('for (let i = 0; i < 5; i = i + 1) {');
    expect(code).toContain('if (i == 2) {');
    expect(code).toContain('continue;');
    expect(code).toContain('if (i == 4) {');
    expect(code).toContain('break;');
    expect(code).toContain('if (done) {');
    expect(code).toContain('break;');
  });

  it('should generate break and continue with proper indentation', () => {
    const source = `for (i = 0; i < 10; i = i + 1) {
      if (skip) {
        continue
      } else {
        if (stop) {
          break
        }
      }
    }`;
    const statements = parseSource(source);
    const code = generateCodeForTest(statements);

    expect(code).toContain('for (let i = 0; i < 10; i = i + 1) {');
    expect(code).toContain('  if (skip) {');
    expect(code).toContain('    continue;');
    expect(code).toContain('  } else {');
    expect(code).toContain('    if (stop) {');
    expect(code).toContain('      break;');
  });
});
