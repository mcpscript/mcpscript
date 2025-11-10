import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import { generateCode } from '../../codegen.js';

describe('If Statement Codegen', () => {
  it('should generate simple if statement with assignment', () => {
    const source = 'if (true) x = 1';
    const statements = parseSource(source);
    const code = generateCode(statements);

    expect(code).toContain('if (true) {');
    expect(code).toContain('  let x = 1;');
    expect(code).toContain('}');
  });

  it('should generate if statement with expression statement', () => {
    const source = 'if (x > 0) print("positive")';
    const statements = parseSource(source);
    const code = generateCode(statements);

    expect(code).toContain('if (x > 0) {');
    expect(code).toContain('  print("positive");');
    expect(code).toContain('}');
  });

  it('should generate if statement with block statement', () => {
    const source = `if (enabled) {
      x = 10
      print(x)
    }`;
    const statements = parseSource(source);
    const code = generateCode(statements);

    expect(code).toContain('if (enabled) {');
    expect(code).toContain('  let x = 10;');
    expect(code).toContain('  print(x);');
    expect(code).toContain('}');
  });

  it('should generate nested if statements', () => {
    const source = 'if (x > 0) if (y > 0) result = "positive"';
    const statements = parseSource(source);
    const code = generateCode(statements);

    expect(code).toContain('if (x > 0) {');
    expect(code).toContain('  if (y > 0) {');
    expect(code).toContain('    let result = "positive";');
    expect(code).toContain('  }');
    expect(code).toContain('}');
  });

  it('should generate complex condition with logical operators', () => {
    const source = 'if (x >= 0 && y < 100) status = "valid"';
    const statements = parseSource(source);
    const code = generateCode(statements);

    expect(code).toContain('if (x >= 0 && y < 100) {');
    expect(code).toContain('  let status = "valid";');
    expect(code).toContain('}');
  });

  it('should handle variable redeclaration in if statements', () => {
    const source = `x = 5
    if (true) x = 10`;
    const statements = parseSource(source);
    const code = generateCode(statements);

    expect(code).toContain('let x = 5;');
    expect(code).toContain('if (true) {');
    expect(code).toContain('  x = 10;'); // Should not redeclare
    expect(code).toContain('}');
  });

  it('should generate if with member expression condition', () => {
    const source = 'if (obj.enabled) obj.count = 5';
    const statements = parseSource(source);
    const code = generateCode(statements);

    expect(code).toContain('if (obj.enabled) {');
    expect(code).toContain('  obj.count = 5;');
    expect(code).toContain('}');
  });

  it('should generate if with function call condition', () => {
    const source = 'if (isValid()) proceed()';
    const statements = parseSource(source);
    const code = generateCode(statements);

    expect(code).toContain('if (isValid()) {');
    expect(code).toContain('  proceed();');
    expect(code).toContain('}');
  });

  it('should generate if with parenthesized condition', () => {
    const source = 'if ((x + y) > 10) result = true';
    const statements = parseSource(source);
    const code = generateCode(statements);

    // Parentheses are removed during parsing since they're not needed for precedence
    expect(code).toContain('if (x + y > 10) {');
    expect(code).toContain('  let result = true;');
    expect(code).toContain('}');
  });

  it('should generate if statement inside block', () => {
    const source = `{
      if (condition) value = 42
    }`;
    const statements = parseSource(source);
    const code = generateCode(statements);

    expect(code).toContain('{');
    expect(code).toContain('  if (condition) {');
    expect(code).toContain('    let value = 42;');
    expect(code).toContain('  }');
    expect(code).toContain('}');
  });

  it('should generate multiple if statements', () => {
    const source = `if (a) x = 1
    if (b) y = 2`;
    const statements = parseSource(source);
    const code = generateCode(statements);

    expect(code).toContain('if (a) {');
    expect(code).toContain('  let x = 1;');
    expect(code).toContain('if (b) {');
    expect(code).toContain('  let y = 2;');
  });

  it('should generate if with unary expression condition', () => {
    const source = 'if (!disabled) activate()';
    const statements = parseSource(source);
    const code = generateCode(statements);

    expect(code).toContain('if (!disabled) {');
    expect(code).toContain('  activate();');
    expect(code).toContain('}');
  });
});
