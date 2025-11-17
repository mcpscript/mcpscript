// Code generator tests for expressions
import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import { generateCodeForTest } from '../test-helpers.js';

describe('Code Generator - Expressions', () => {
  it('should handle function calls', () => {
    const source = `
result = processData("input", 42, true)
print("Result:", result)
    `.trim();

    const ast = parseSource(source);
    const code = generateCodeForTest(ast);

    expect(code).toContain(
      'let result = await processData("input", 42, true);'
    );
    expect(code).toContain('print("Result:", result);');
  });

  describe('Binary Expressions', () => {
    it('should generate basic arithmetic operations', () => {
      const source = `
result = a + b
x = 10 - 5
y = m * n
z = p / q
w = r % s
      `.trim();

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let result = a + b;');
      expect(code).toContain('let x = 10 - 5;');
      expect(code).toContain('let y = m * n;');
      expect(code).toContain('let z = p / q;');
      expect(code).toContain('let w = r % s;');
    });

    it('should handle operator precedence correctly', () => {
      const source = `
result = a + b * c
x = m - n / p
      `.trim();

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let result = a + b * c;');
      expect(code).toContain('let x = m - n / p;');
    });

    it('should add parentheses when needed for precedence', () => {
      const source = `
result = (a + b) * c
x = (m - n) / p
      `.trim();

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let result = (a + b) * c;');
      expect(code).toContain('let x = (m - n) / p;');
    });

    it('should handle left associativity correctly', () => {
      const source = `
result = a - b + c
x = m / n * p
      `.trim();

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let result = a - b + c;');
      expect(code).toContain('let x = m / n * p;');
    });

    it('should handle complex nested expressions', () => {
      const source = `
result = (a + b) * (c - d)
complex = (x + y * 2) / (z - 1)
      `.trim();

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let result = (a + b) * (c - d);');
      expect(code).toContain('let complex = (x + y * 2) / (z - 1);');
    });

    it('should work with mixed literals and variables', () => {
      const source = `
result = 10 + x * 2.5
calc = y / 3 - 1.5
      `.trim();

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let result = 10 + x * 2.5;');
      expect(code).toContain('let calc = y / 3 - 1.5;');
    });

    it('should work in function call arguments', () => {
      const source = `
result = calculate(a + b, x * y)
process(10 - 5, m / n)
      `.trim();

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let result = await calculate(a + b, x * y);');
      expect(code).toContain('process(10 - 5, m / n);');
    });

    it('should work with boolean expressions and mixed types', () => {
      const source = `
result = count + 1
flag = enabled + false
mixed = 3.14 * radius
      `.trim();

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let result = count + 1;');
      expect(code).toContain('let flag = enabled + false;');
      expect(code).toContain('let mixed = 3.14 * radius;');
    });

    it('should work with arrays containing binary expressions', () => {
      const source = `
results = [a + b, x * y, m - n]
      `.trim();

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let results = [a + b, x * y, m - n];');
    });

    it('should work with objects containing binary expressions', () => {
      const source = `
config = { sum: a + b, product: x * y, diff: m - n }
      `.trim();

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain(
        'let config = { sum: a + b, product: x * y, diff: m - n };'
      );
    });

    // Comparison operators tests
    it('should generate code for equality comparisons', () => {
      const source = `
result1 = a == b
result2 = x != y
      `.trim();

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let result1 = a == b;');
      expect(code).toContain('let result2 = x != y;');
    });

    it('should generate code for relational comparisons', () => {
      const source = `
result1 = a < b
result2 = x > y
result3 = m <= n
result4 = p >= q
      `.trim();

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let result1 = a < b;');
      expect(code).toContain('let result2 = x > y;');
      expect(code).toContain('let result3 = m <= n;');
      expect(code).toContain('let result4 = p >= q;');
    });

    it('should handle comparison operator precedence correctly', () => {
      const source = `
result1 = a + b == c * d
result2 = x - y != p / q
result3 = m * 2 < n + 1
      `.trim();

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let result1 = a + b == c * d;');
      expect(code).toContain('let result2 = x - y != p / q;');
      expect(code).toContain('let result3 = m * 2 < n + 1;');
    });

    it('should generate code for comparisons with literals', () => {
      const source = `
result1 = age >= 18
result2 = score < 100
result3 = name == "John"
result4 = flag != true
      `.trim();

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let result1 = age >= 18;');
      expect(code).toContain('let result2 = score < 100;');
      expect(code).toContain('let result3 = name == "John";');
      expect(code).toContain('let result4 = flag != true;');
    });

    it('should handle parentheses with comparisons', () => {
      const source = `
result1 = (a == b) != (c < d)
result2 = (x + y) > (m - n)
      `.trim();

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      // For same-precedence comparison operators, left operand doesn't need parentheses
      // but right operand with same precedence does need them in some cases
      expect(code).toContain('let result1 = a == b != (c < d);');
      // Arithmetic has higher precedence than comparison, so no parentheses needed
      expect(code).toContain('let result2 = x + y > m - n;');
    });

    it('should work with comparisons in function calls', () => {
      const source = `
result = process(a == b, x < y)
check(age >= 18, score > 90)
      `.trim();

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let result = await process(a == b, x < y);');
      expect(code).toContain('check(age >= 18, score > 90);');
    });

    it('should work with comparisons in arrays and objects', () => {
      const source = `
checks = [a == b, x < y, m >= n]
results = { equal: a == b, less: x < y, greater: m > n }
      `.trim();

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let checks = [a == b, x < y, m >= n];');
      expect(code).toContain(
        'let results = { equal: a == b, less: x < y, greater: m > n };'
      );
    });

    it('should handle chained comparisons', () => {
      const source = `
result1 = a < b == c
result2 = x != y <= z
      `.trim();

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let result1 = a < b == c;');
      expect(code).toContain('let result2 = x != y <= z;');
    });
  });
});
