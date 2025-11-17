import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import { generateCodeUnsafe } from '../../codegen.js';

describe('Codegen - Tool Declarations', () => {
  it('should generate code for a simple tool with no parameters', () => {
    const source = `
      tool myTool() {
        x = 5
      }
    `;
    const statements = parseSource(source);
    const code = generateCodeUnsafe(statements);

    expect(code).toContain('const myTool = __createUserTool(');
    expect(code).toContain('async () =>');
    expect(code).toContain('let x = 5;');
  });

  it('should generate code for a tool with one parameter', () => {
    const source = `
      tool processData(input) {
        return input
      }
    `;
    const statements = parseSource(source);
    const code = generateCodeUnsafe(statements);

    expect(code).toContain('const processData = __createUserTool(');
    expect(code).toContain('async (input) =>');
    expect(code).toContain('return input;');
  });

  it('should generate code for a tool with multiple parameters', () => {
    const source = `
      tool calculateScore(points, multiplier, bonus) {
        result = points * multiplier + bonus
        return result
      }
    `;
    const statements = parseSource(source);
    const code = generateCodeUnsafe(statements);

    expect(code).toContain('const calculateScore = __createUserTool(');
    expect(code).toContain('async (points, multiplier, bonus) =>');
    expect(code).toContain('let result = points * multiplier + bonus;');
    expect(code).toContain('return result;');
  });

  it('should generate code for a tool with return statement without value', () => {
    const source = `
      tool earlyExit() {
        return
      }
    `;
    const statements = parseSource(source);
    const code = generateCodeUnsafe(statements);

    expect(code).toContain('return;');
  });

  it('should not redeclare parameters inside tool body', () => {
    const source = `
      tool updateValue(value) {
        value = value + 1
        return value
      }
    `;
    const statements = parseSource(source);
    const code = generateCodeUnsafe(statements);

    // Should reassign, not redeclare
    expect(code).toContain('value = value + 1;');
    expect(code).not.toContain('let value = value + 1;');
  });

  it('should declare new variables inside tool body', () => {
    const source = `
      tool processData(input) {
        result = input * 2
        return result
      }
    `;
    const statements = parseSource(source);
    const code = generateCodeUnsafe(statements);

    // Should declare result (new variable)
    expect(code).toContain('let result = input * 2;');
  });

  it('should generate code for a tool with conditional logic', () => {
    const source = `
      tool checkValue(x) {
        if (x > 10) {
          return true
        } else {
          return false
        }
      }
    `;
    const statements = parseSource(source);
    const code = generateCodeUnsafe(statements);

    expect(code).toContain('if (x > 10)');
    expect(code).toContain('return true;');
    expect(code).toContain('return false;');
  });

  it('should generate code for a tool with loops', () => {
    const source = `
      tool sumArray(items) {
        total = 0
        for (i = 0; i < 10; i = i + 1) {
          total = total + items[i]
        }
        return total
      }
    `;
    const statements = parseSource(source);
    const code = generateCodeUnsafe(statements);

    expect(code).toContain('let total = 0;');
    expect(code).toContain('for (let i = 0; i < 10; i = i + 1)');
    expect(code).toContain('total = total + items[i];');
  });

  it('should generate code for multiple tools', () => {
    const source = `
      tool first(a) {
        return a * 2
      }

      tool second(b, c) {
        return b + c
      }
    `;
    const statements = parseSource(source);
    const code = generateCodeUnsafe(statements);

    expect(code).toContain('const first = __createUserTool(');
    expect(code).toContain('const second = __createUserTool(');
    expect(code).toContain('async (a) =>');
    expect(code).toContain('async (b, c) =>');
  });

  it('should generate code for a tool that calls other functions', () => {
    const source = `
      tool processFile(path) {
        content = filesystem.readFile(path)
        parsed = JSON.parse(content)
        return parsed
      }
    `;
    const statements = parseSource(source);
    const code = generateCodeUnsafe(statements);

    expect(code).toContain('let content = await filesystem.readFile(path);');
    expect(code).toContain('let parsed = await JSON.parse(content);');
    expect(code).toContain('return parsed;');
  });

  it('should generate code for tool calling another tool', () => {
    const source = `
      tool helper(x) {
        return x * 2
      }

      tool main(value) {
        result = helper(value)
        return result
      }
    `;
    const statements = parseSource(source);
    const code = generateCodeUnsafe(statements);

    expect(code).toContain('const helper = __createUserTool(');
    expect(code).toContain('const main = __createUserTool(');
    expect(code).toContain('async (x) =>');
    expect(code).toContain('async (value) =>');
    // Tool calls are async and require await
    expect(code).toContain('let result = await helper(value);');
  });

  it('should handle nested scopes correctly in tools', () => {
    const source = `
      tool complexTool(x) {
        if (x > 0) {
          y = x * 2
          z = y + 1
        }
        return y
      }
    `;
    const statements = parseSource(source);
    const code = generateCodeUnsafe(statements);

    // y and z should be declared inside the if block
    expect(code).toContain('let y = x * 2;');
    expect(code).toContain('let z = y + 1;');
  });

  it('should not include tool declarations in main code section', () => {
    const source = `
      tool myTool(a) {
        return a
      }

      x = 5
    `;
    const statements = parseSource(source);
    const code = generateCodeUnsafe(statements);

    // Tool should be in its own section, not in "Generated code" section
    const parts = code.split('// Generated code');
    expect(parts.length).toBe(2);
    expect(parts[0]).toContain('const myTool = __createUserTool(');
    expect(parts[0]).toContain('async (a) =>');
    expect(parts[1]).toContain('let x = 5;');
    expect(parts[1]).not.toContain('const myTool');
  });
});
