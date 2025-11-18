import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import { generateCodeForTest } from '../test-helpers.js';

describe('If Statement Codegen', () => {
  it('should generate simple if statement with assignment', () => {
    const source = 'if (true) x = 1';
    const statements = parseSource(source);
    const code = generateCodeForTest(statements);

    expect(code).toContain('if (true) {');
    expect(code).toContain('  let x = 1;');
    expect(code).toContain('}');
  });

  it('should generate if statement with expression statement', () => {
    const source = 'if (x > 0) print("positive")';
    const statements = parseSource(source);
    const code = generateCodeForTest(statements);

    expect(code).toContain('if (x > 0) {');
    expect(code).toContain('  await print("positive");');
    expect(code).toContain('}');
  });

  it('should generate if statement with block statement', () => {
    const source = `if (enabled) {
      x = 10
      print(x)
    }`;
    const statements = parseSource(source);
    const code = generateCodeForTest(statements);

    expect(code).toContain('if (enabled) {');
    expect(code).toContain('  let x = 10;');
    expect(code).toContain('  await print(x);');
    expect(code).toContain('}');
  });

  it('should generate nested if statements', () => {
    const source = 'if (x > 0) if (y > 0) result = "positive"';
    const statements = parseSource(source);
    const code = generateCodeForTest(statements);

    expect(code).toContain('if (x > 0) {');
    expect(code).toContain('  if (y > 0) {');
    expect(code).toContain('    let result = "positive";');
    expect(code).toContain('  }');
    expect(code).toContain('}');
  });

  it('should generate complex condition with logical operators', () => {
    const source = 'if (x >= 0 && y < 100) status = "valid"';
    const statements = parseSource(source);
    const code = generateCodeForTest(statements);

    expect(code).toContain('if (x >= 0 && y < 100) {');
    expect(code).toContain('  let status = "valid";');
    expect(code).toContain('}');
  });

  it('should handle variable redeclaration in if statements', () => {
    const source = `x = 5
    if (true) x = 10`;
    const statements = parseSource(source);
    const code = generateCodeForTest(statements);

    expect(code).toContain('let x = 5;');
    expect(code).toContain('if (true) {');
    expect(code).toContain('  x = 10;'); // Should not redeclare
    expect(code).toContain('}');
  });

  it('should generate if with member expression condition', () => {
    const source = 'if (obj.enabled) obj.count = 5';
    const statements = parseSource(source);
    const code = generateCodeForTest(statements);

    expect(code).toContain('if (obj.enabled) {');
    expect(code).toContain('  obj.count = 5;');
    expect(code).toContain('}');
  });

  it('should generate if with function call condition', () => {
    const source = 'if (isValid()) proceed()';
    const statements = parseSource(source);
    const code = generateCodeForTest(statements);

    expect(code).toContain('if (await isValid()) {');
    expect(code).toContain('  await proceed();');
    expect(code).toContain('}');
  });

  it('should generate if with parenthesized condition', () => {
    const source = 'if ((x + y) > 10) result = true';
    const statements = parseSource(source);
    const code = generateCodeForTest(statements);

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
    const code = generateCodeForTest(statements);

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
    const code = generateCodeForTest(statements);

    expect(code).toContain('if (a) {');
    expect(code).toContain('  let x = 1;');
    expect(code).toContain('if (b) {');
    expect(code).toContain('  let y = 2;');
  });

  it('should generate if with unary expression condition', () => {
    const source = 'if (!disabled) activate()';
    const statements = parseSource(source);
    const code = generateCodeForTest(statements);

    expect(code).toContain('if (!disabled) {');
    expect(code).toContain('  await activate();');
    expect(code).toContain('}');
  });

  it('should generate simple if-else statement', () => {
    const source = 'if (true) x = 1 else y = 2';
    const statements = parseSource(source);
    const code = generateCodeForTest(statements);

    expect(code).toContain('if (true) {');
    expect(code).toContain('  let x = 1;');
    expect(code).toContain('} else {');
    expect(code).toContain('  let y = 2;');
    expect(code).toContain('}');
  });

  it('should generate if-else with block statements', () => {
    const source = `if (condition) {
      x = 10
      print(x)
    } else {
      y = 20
      print(y)
    }`;
    const statements = parseSource(source);
    const code = generateCodeForTest(statements);

    expect(code).toContain('if (condition) {');
    expect(code).toContain('  let x = 10;');
    expect(code).toContain('  await print(x);');
    expect(code).toContain('} else {');
    expect(code).toContain('  let y = 20;');
    expect(code).toContain('  await print(y);');
    expect(code).toContain('}');
  });

  it('should generate if-else with mixed block and non-block statements', () => {
    const source = `if (x > 0) {
      result = "positive"
    } else result = "negative"`;
    const statements = parseSource(source);
    const code = generateCodeForTest(statements);

    expect(code).toContain('if (x > 0) {');
    expect(code).toContain('  let result = "positive";');
    expect(code).toContain('} else {');
    expect(code).toContain('  let result = "negative";'); // Sibling scopes can each declare their own variables
    expect(code).toContain('}');
  });

  it('should generate if-else if chain', () => {
    const source =
      'if (x > 0) result = "positive" else if (x < 0) result = "negative" else result = "zero"';
    const statements = parseSource(source);
    const code = generateCodeForTest(statements);

    expect(code).toContain('if (x > 0) {');
    expect(code).toContain('  let result = "positive";');
    expect(code).toContain('} else {');
    expect(code).toContain('  if (x < 0) {'); // Nested if inside else block
    expect(code).toContain('    result = "negative";'); // Inherits result from parent scope
    expect(code).toContain('  } else {');
    expect(code).toContain('    result = "zero";'); // Inherits result from parent scope
    expect(code).toContain('  }');
    expect(code).toContain('}');
  });

  it('should generate nested if-else statements', () => {
    const source = 'if (outer) if (inner) a = 1 else a = 2 else b = 3';
    const statements = parseSource(source);
    const code = generateCodeForTest(statements);

    expect(code).toContain('if (outer) {');
    expect(code).toContain('  if (inner) {');
    expect(code).toContain('    let a = 1;');
    expect(code).toContain('  } else {');
    expect(code).toContain('    a = 2;'); // Inherits a from the if scope
    expect(code).toContain('  }');
    expect(code).toContain('} else {');
    expect(code).toContain('  let b = 3;');
    expect(code).toContain('}');
  });

  it('should generate if-else with complex expressions', () => {
    const source =
      'if (x >= 0 && y < 100) status = "valid" else status = "invalid"';
    const statements = parseSource(source);
    const code = generateCodeForTest(statements);

    expect(code).toContain('if (x >= 0 && y < 100) {');
    expect(code).toContain('  let status = "valid";');
    expect(code).toContain('} else {');
    expect(code).toContain('  status = "invalid";'); // Inherits status from parent scope
    expect(code).toContain('}');
  });

  it('should handle variable scope correctly in if-else', () => {
    const source = `x = 5
    if (condition) x = 10 else x = 20`;
    const statements = parseSource(source);
    const code = generateCodeForTest(statements);

    expect(code).toContain('let x = 5;');
    expect(code).toContain('if (condition) {');
    expect(code).toContain('  x = 10;'); // Should not redeclare
    expect(code).toContain('} else {');
    expect(code).toContain('  x = 20;'); // Should not redeclare
    expect(code).toContain('}');
  });

  it('should generate if-else with function calls', () => {
    const source = 'if (isValid()) success() else error()';
    const statements = parseSource(source);
    const code = generateCodeForTest(statements);

    expect(code).toContain('if (await isValid()) {');
    expect(code).toContain('  await success();');
    expect(code).toContain('} else {');
    expect(code).toContain('  await error();');
    expect(code).toContain('}');
  });

  it('should generate if-else with member expressions', () => {
    const source = 'if (obj.enabled) obj.count = 5 else obj.count = 0';
    const statements = parseSource(source);
    const code = generateCodeForTest(statements);

    expect(code).toContain('if (obj.enabled) {');
    expect(code).toContain('  obj.count = 5;');
    expect(code).toContain('} else {');
    expect(code).toContain('  obj.count = 0;');
    expect(code).toContain('}');
  });
});
