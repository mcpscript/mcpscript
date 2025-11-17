// Code generator tests for literals
import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import { generateCodeForTest } from '../test-helpers.js';

describe('Code Generator - Literals', () => {
  it('should handle arrays and objects', () => {
    const source = `
config = { name: "test", port: 8080, enabled: true }
items = [1, 2, 3]
    `.trim();

    const ast = parseSource(source);
    const code = generateCodeForTest(ast);

    expect(code).toContain(
      'let config = { name: "test", port: 8080, enabled: true };'
    );
    expect(code).toContain('let items = [1, 2, 3];');
  });

  it('should generate code for integer literals', () => {
    const source = `
zero = 0
positive = 42
large = 123456
    `.trim();

    const ast = parseSource(source);
    const code = generateCodeForTest(ast);

    expect(code).toContain('let zero = 0;');
    expect(code).toContain('let positive = 42;');
    expect(code).toContain('let large = 123456;');
  });

  it('should generate code for decimal literals', () => {
    const source = `
pi = 3.14159
half = 0.5
fraction = .25
    `.trim();

    const ast = parseSource(source);
    const code = generateCodeForTest(ast);

    expect(code).toContain('let pi = 3.14159;');
    expect(code).toContain('let half = 0.5;');
    expect(code).toContain('let fraction = 0.25;');
  });

  it('should generate code for scientific notation', () => {
    const source = `
large = 1e5
small = 2.5e-3
avogadro = 6.022e23
uppercase = 1E10
positive = 1.23E+5
negative = 4.56E-7
    `.trim();

    const ast = parseSource(source);
    const code = generateCodeForTest(ast);

    expect(code).toContain('let large = 100000;');
    expect(code).toContain('let small = 0.0025;');
    expect(code).toContain('let avogadro = 6.022e+23;');
    expect(code).toContain('let uppercase = 10000000000;');
    expect(code).toContain('let positive = 123000;');
    expect(code).toContain('let negative = 4.56e-7;');
  });

  it('should generate code for numbers in arrays and objects', () => {
    const source = `
numbers = [42, 3.14, 1e5, 2.5e-3]
config = { port: 8080, ratio: 0.75, timeout: 1e4 }
    `.trim();

    const ast = parseSource(source);
    const code = generateCodeForTest(ast);

    expect(code).toContain('let numbers = [42, 3.14, 100000, 0.0025];');
    expect(code).toContain(
      'let config = { port: 8080, ratio: 0.75, timeout: 10000 };'
    );
  });

  it('should generate code for numbers in function calls', () => {
    const source = `
result = calculate(42, 3.14, 1e-5)
mcp server { command: "test", args: [5000, 3] }
    `.trim();

    const ast = parseSource(source);
    const code = generateCodeForTest(ast);

    expect(code).toContain('let result = await calculate(42, 3.14, 0.00001);');
    expect(code).toContain('args: [5000, 3]');
  });

  it('should generate code for boolean literals', () => {
    const source = `
isEnabled = true
isDisabled = false
    `.trim();

    const ast = parseSource(source);
    const code = generateCodeForTest(ast);

    expect(code).toContain('let isEnabled = true;');
    expect(code).toContain('let isDisabled = false;');
  });

  it('should generate code for booleans in arrays and objects', () => {
    const source = `
flags = [true, false, true]
config = { enabled: true, debug: false, verbose: true }
    `.trim();

    const ast = parseSource(source);
    const code = generateCodeForTest(ast);

    expect(code).toContain('let flags = [true, false, true];');
    expect(code).toContain(
      'let config = { enabled: true, debug: false, verbose: true };'
    );
  });

  it('should generate code for booleans in function calls', () => {
    const source = `
result = processData("input", 42, true, false)
mcp server { command: "test", verbose: true }
    `.trim();

    const ast = parseSource(source);
    const code = generateCodeForTest(ast);

    expect(code).toContain(
      'let result = await processData("input", 42, true, false);'
    );
    expect(code).toContain('verbose: true');
  });
});
