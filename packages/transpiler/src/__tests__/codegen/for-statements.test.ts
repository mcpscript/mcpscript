// Code generator tests for for statements
import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import { generateCode } from '../../codegen.js';

describe('Code Generator - For Statements', () => {
  it('should generate code for basic for loop', () => {
    const source = 'for (i = 0; i < 10; i = i + 1) { print(i) }';
    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('for (let i = 0; i < 10; i = i + 1) {');
    expect(code).toContain('  print(i);');
    expect(code).toContain('}');
  });

  it('should generate code for for loop with empty init', () => {
    const source = `
i = 5
for (; i > 0; i = i - 1) { print(i) }
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('let i = 5;');
    expect(code).toContain('for (; i > 0; i = i - 1) {');
    expect(code).toContain('  print(i);');
  });

  it('should generate code for for loop with empty condition', () => {
    const source = 'for (count = 0; ; count = count + 1) { print("infinite") }';
    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('for (let count = 0; ; count = count + 1) {');
    expect(code).toContain('  print("infinite");');
  });

  it('should generate code for for loop with empty update', () => {
    const source = 'for (i = 0; i < 5; ) { print(i) }';
    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('for (let i = 0; i < 5; ) {');
    expect(code).toContain('  print(i);');
  });

  it('should generate code for for loop with all parts empty', () => {
    const source = 'for (;;) { print("loop") }';
    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('for (;;) {');
    expect(code).toContain('  print("loop");');
  });

  it('should generate code for for loop with single statement body', () => {
    const source = 'for (i = 0; i < 3; i = i + 1) print(i)';
    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('for (let i = 0; i < 3; i = i + 1) {');
    expect(code).toContain('  print(i);');
    expect(code).toContain('}');
  });

  it('should generate code for nested for loops', () => {
    const source = `
for (i = 0; i < 2; i = i + 1) {
  for (j = 0; j < 2; j = j + 1) {
    print(i + j)
  }
}
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('for (let i = 0; i < 2; i = i + 1) {');
    expect(code).toContain('  for (let j = 0; j < 2; j = j + 1) {');
    expect(code).toContain('    print(i + j);');
  });

  it('should generate code for for loop with variable reuse', () => {
    const source = `
x = 10
for (x = 0; x < 5; x = x + 1) { print(x) }
print(x)
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('let x = 10;');
    expect(code).toContain('for (x = 0; x < 5; x = x + 1) {');
    expect(code).toContain('print(x);');
  });

  it('should generate code for for loop with complex expressions', () => {
    const source =
      'for (x = 2 * 5; x > 0 && x < 100; x = x - 2) { result = x / 2 }';
    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain(
      'for (let x = 2 * 5; x > 0 && x < 100; x = x - 2) {'
    );
    expect(code).toContain('  let result = x / 2;');
  });

  it('should generate code for for loop with array access', () => {
    const source = `
arr = [1, 2, 3, 4, 5]
for (i = 0; i < 5; i = i + 1) {
  arr[i] = arr[i] * 2
}
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('let arr = [1, 2, 3, 4, 5];');
    expect(code).toContain('for (let i = 0; i < 5; i = i + 1) {');
    expect(code).toContain('  arr[i] = arr[i] * 2;');
  });

  it('should generate code for for loop with object property access', () => {
    const source = `
obj = { count: 0 }
for (i = 0; i < 3; i = i + 1) {
  obj.count = obj.count + 1
}
    `.trim();

    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('let obj = { count: 0 };');
    expect(code).toContain('for (let i = 0; i < 3; i = i + 1) {');
    expect(code).toContain('  obj.count = obj.count + 1;');
  });
});
