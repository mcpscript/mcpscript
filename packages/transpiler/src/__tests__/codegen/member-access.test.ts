// Code generator tests for member access expressions
import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import { generateCodeForTest } from '../test-helpers.js';

describe('Code Generator - Member Access', () => {
  describe('Dot Notation', () => {
    it('should generate code for simple property access', () => {
      const source = `result = obj.property`;

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let result = obj.property;');
    });

    it('should generate code for chained property access', () => {
      const source = `value = user.profile.name`;

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let value = user.profile.name;');
    });

    it('should generate code for property access in expressions', () => {
      const source = `
sum = obj.a + obj.b
product = config.width * config.height
      `.trim();

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let sum = obj.a + obj.b;');
      expect(code).toContain('let product = config.width * config.height;');
    });

    it('should generate code for property access in function calls', () => {
      const source = `
result = process(user.name, user.age)
output = format(data.title)
      `.trim();

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let result = process(user.name, user.age);');
      expect(code).toContain('let output = format(data.title);');
    });

    it('should generate code for method calls', () => {
      const source = `
result = obj.method()
output = data.process("arg1", 42)
      `.trim();

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let result = await obj.method();');
      expect(code).toContain('let output = await data.process("arg1", 42);');
    });

    it('should generate code for chained method calls', () => {
      const source = `result = obj.getData().process()`;

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let result = await obj.getData().process();');
    });

    it('should generate code for property access in arrays', () => {
      const source = `items = [user.name, user.email, user.age]`;

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let items = [user.name, user.email, user.age];');
    });

    it('should generate code for property access in objects', () => {
      const source = `config = { title: data.title, size: data.size }`;

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain(
        'let config = { title: data.title, size: data.size };'
      );
    });
  });

  describe('Bracket Notation', () => {
    it('should generate code for simple bracket access', () => {
      const source = `result = obj["key"]`;

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let result = obj["key"];');
    });

    it('should generate code for array indexing', () => {
      const source = `
first = items[0]
last = items[count - 1]
      `.trim();

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let first = items[0];');
      expect(code).toContain('let last = items[count - 1];');
    });

    it('should generate code for dynamic property access', () => {
      const source = `
value = obj[key]
result = data[fieldName]
      `.trim();

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let value = obj[key];');
      expect(code).toContain('let result = data[fieldName];');
    });

    it('should generate code for nested bracket access', () => {
      const source = `value = matrix[row][col]`;

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let value = matrix[row][col];');
    });

    it('should generate code for bracket access with expressions', () => {
      const source = `
value = arr[index + 1]
result = data[key + suffix]
      `.trim();

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let value = arr[index + 1];');
      expect(code).toContain('let result = data[key + suffix];');
    });

    it('should generate code for bracket access in function calls', () => {
      const source = `result = process(arr[0], obj["key"])`;

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let result = process(arr[0], obj["key"]);');
    });
  });

  describe('Mixed Access Patterns', () => {
    it('should generate code for mixed dot and bracket access', () => {
      const source = `
value = obj.items[0]
result = data["config"].settings
      `.trim();

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let value = obj.items[0];');
      expect(code).toContain('let result = data["config"].settings;');
    });

    it('should generate code for complex chained access', () => {
      const source = `value = users[0].profile.settings["theme"]`;

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let value = users[0].profile.settings["theme"];');
    });

    it('should generate code for member access with binary expressions', () => {
      const source = `
result = obj.a + arr[0]
sum = data.width * data.height
      `.trim();

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let result = obj.a + arr[0];');
      expect(code).toContain('let sum = data.width * data.height;');
    });

    it('should generate code for member access with comparisons', () => {
      const source = `
isValid = user.age >= 18
hasItems = arr.length > 0
      `.trim();

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let isValid = user.age >= 18;');
      expect(code).toContain('let hasItems = arr.length > 0;');
    });
  });

  describe('Member Access as Statements', () => {
    it('should generate code for method calls as statements', () => {
      const source = `
obj.method()
data.process("arg")
      `.trim();

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('await obj.method();');
      expect(code).toContain('await data.process("arg");');
    });

    it('should generate code for chained method calls as statements', () => {
      const source = `obj.getData().process().save()`;

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('await obj.getData().process().save();');
    });
  });

  describe('Error Cases and Edge Cases', () => {
    it('should handle property names that need quoting', () => {
      const source = `value = obj["special-key"]`;

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let value = obj["special-key"];');
    });

    it('should handle numeric property access', () => {
      const source = `value = obj[123]`;

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let value = obj[123];');
    });

    it('should handle boolean expressions in brackets', () => {
      const source = `value = obj[key == "test"]`;

      const ast = parseSource(source);
      const code = generateCodeForTest(ast);

      expect(code).toContain('let value = obj[key == "test"];');
    });
  });
});
