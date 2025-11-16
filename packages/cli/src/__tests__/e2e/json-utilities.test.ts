// E2E tests for JSON utilities
import { describe, it, expect } from 'vitest';
import { parseSource } from '@mcps/transpiler';
import { generateCode } from '@mcps/transpiler';
import { executeInVM } from '@mcps/runtime';

describe('E2E - JSON Utilities', () => {
  describe('JSON.parse()', () => {
    it('should parse valid JSON string', async () => {
      const source = `
        jsonString = "{\\"name\\":\\"John\\",\\"age\\":30}"
        data = JSON.parse(jsonString)
        result = data.name
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.result).toBe('John');
    });

    it('should parse JSON array', async () => {
      const source = `
        jsonString = "[1, 2, 3, 4, 5]"
        arr = JSON.parse(jsonString)
        result = arr[2]
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.result).toBe(3);
    });

    it('should parse nested JSON objects', async () => {
      const source = `
        jsonString = "{\\"user\\":{\\"name\\":\\"Alice\\",\\"age\\":25}}"
        data = JSON.parse(jsonString)
        result = data.user.name
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.result).toBe('Alice');
    });

    it('should parse JSON with boolean values', async () => {
      const source = `
        jsonString = "{\\"active\\":true,\\"verified\\":false}"
        data = JSON.parse(jsonString)
        result = data.active
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.result).toBe(true);
    });

    it('should parse JSON with null values', async () => {
      const source = `
        jsonString = "{\\"value\\":null}"
        data = JSON.parse(jsonString)
        result = data.value == null
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.result).toBe(true);
    });

    it('should parse JSON with numbers', async () => {
      const source = `
        jsonString = "{\\"int\\":42,\\"float\\":3.14,\\"negative\\": -10}"
        data = JSON.parse(jsonString)
        sum = data.int + data.float + data.negative
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.sum).toBeCloseTo(35.14);
    });
  });

  describe('JSON.stringify()', () => {
    it('should stringify an object', async () => {
      const source = `
        obj = { name: "Bob", age: 28 }
        result = JSON.stringify(obj)
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      const parsed = JSON.parse(context.result as string);
      expect(parsed.name).toBe('Bob');
      expect(parsed.age).toBe(28);
    });

    it('should stringify an array', async () => {
      const source = `
        arr = [1, 2, 3, 4, 5]
        result = JSON.stringify(arr)
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.result).toBe('[1,2,3,4,5]');
    });

    it('should stringify nested objects', async () => {
      const source = `
        obj = {
          user: {
            name: "Charlie",
            profile: {
              age: 35,
              city: "NYC"
            }
          }
        }
        result = JSON.stringify(obj)
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      const parsed = JSON.parse(context.result as string);
      expect(parsed.user.name).toBe('Charlie');
      expect(parsed.user.profile.city).toBe('NYC');
    });

    it('should stringify boolean values', async () => {
      const source = `
        obj = { success: true, failed: false }
        result = JSON.stringify(obj)
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      const parsed = JSON.parse(context.result as string);
      expect(parsed.success).toBe(true);
      expect(parsed.failed).toBe(false);
    });

    it('should stringify numbers', async () => {
      const source = `
        obj = { int: 100, float: 2.5, negative: -50 }
        result = JSON.stringify(obj)
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      const parsed = JSON.parse(context.result as string);
      expect(parsed.int).toBe(100);
      expect(parsed.float).toBe(2.5);
      expect(parsed.negative).toBe(-50);
    });
  });

  describe('JSON round-trip', () => {
    it('should round-trip simple objects', async () => {
      const source = `
        original = { name: "Test", value: 42 }
        jsonString = JSON.stringify(original)
        parsed = JSON.parse(jsonString)
        result = parsed.name
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.result).toBe('Test');
    });

    it('should round-trip arrays', async () => {
      const source = `
        original = [1, 2, 3]
        jsonString = JSON.stringify(original)
        parsed = JSON.parse(jsonString)
        result = parsed[1]
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.result).toBe(2);
    });

    it('should round-trip nested structures', async () => {
      const source = `
        original = {
          users: [
            { name: "Alice", age: 30 },
            { name: "Bob", age: 25 }
          ],
          count: 2
        }
        jsonString = JSON.stringify(original)
        parsed = JSON.parse(jsonString)
        result = parsed.users[1].name
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.result).toBe('Bob');
    });
  });

  describe('JSON with real-world use cases', () => {
    it('should parse API response', async () => {
      const source = `
        apiResponse = "{\\"status\\":\\"success\\",\\"data\\":{\\"id\\":123,\\"name\\":\\"Product\\"}}"
        response = JSON.parse(apiResponse)
        isSuccess = response.status == "success"
        productName = response.data.name
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.isSuccess).toBe(true);
      expect(context.productName).toBe('Product');
    });

    it('should stringify config object', async () => {
      const source = `
        config = {
          apiKey: "test-key",
          timeout: 5000,
          retries: 3,
          endpoints: {
            primary: "https://api.example.com",
            backup: "https://backup.example.com"
          }
        }
        configJson = JSON.stringify(config)
        parsed = JSON.parse(configJson)
        result = parsed.endpoints.primary
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.result).toBe('https://api.example.com');
    });

    it('should work with array of objects', async () => {
      const source = `
        users = [
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
          { id: 3, name: "Charlie" }
        ]
        usersJson = JSON.stringify(users)
        parsed = JSON.parse(usersJson)
        result = parsed[2].name
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const context = await executeInVM(code, { timeout: 1000 });

      expect(context.result).toBe('Charlie');
    });
  });

  describe('Error handling', () => {
    it('should throw error on invalid JSON', async () => {
      const source = `
        invalidJson = "{invalid json}"
        data = JSON.parse(invalidJson)
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);

      await expect(executeInVM(code, { timeout: 1000 })).rejects.toThrow();
    });

    it('should handle empty string', async () => {
      const source = `
        emptyJson = ""
        data = JSON.parse(emptyJson)
      `;
      const ast = parseSource(source);
      const code = generateCode(ast);

      await expect(executeInVM(code, { timeout: 1000 })).rejects.toThrow();
    });
  });
});
