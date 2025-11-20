// E2E tests for nullable type schemas
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { parseSource, generateCode } from '@mcpscript/transpiler';
import { executeInVM } from '@mcpscript/runtime';
import type { MockInstance } from 'vitest';
import { vi } from 'vitest';

describe('Nullable Types Schema E2E', () => {
  let consoleSpy: MockInstance;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('Nullable Parameter Schemas', () => {
    it('should generate schema for nullable string', async () => {
      const source = `
        tool greet(name: string | null): string {
          if (name == null) {
            return "Hello, stranger"
          }
          return "Hello " + name
        }
        
        result1 = greet("Alice")
        print(result1)
        
        result2 = greet(null)
        print(result2)
      `;

      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('__buildZodSchema');

      await executeInVM(code, { timeout: 5000 });
      expect(consoleSpy).toHaveBeenCalledWith('Hello Alice');
      expect(consoleSpy).toHaveBeenCalledWith('Hello, stranger');
    });

    it('should generate schema for nullable number', async () => {
      const source = `
        tool double(x: number | null): number {
          if (x == null) {
            return 0
          }
          return x * 2
        }
        
        result1 = double(21)
        print(result1)
        
        result2 = double(null)
        print(result2)
      `;

      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('__buildZodSchema');

      await executeInVM(code, { timeout: 5000 });
      expect(consoleSpy).toHaveBeenCalledWith(42);
      expect(consoleSpy).toHaveBeenCalledWith(0);
    });

    it('should generate schema for nullable array', async () => {
      const source = `
        tool getLength(items: string[] | null): number {
          if (items == null) {
            return 0
          }
          return items.length
        }
        
        result1 = getLength(["a", "b", "c"])
        print(result1)
        
        result2 = getLength(null)
        print(result2)
      `;

      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('__buildZodSchema');

      await executeInVM(code, { timeout: 5000 });
      expect(consoleSpy).toHaveBeenCalledWith(3);
      expect(consoleSpy).toHaveBeenCalledWith(0);
    });

    it('should generate schema for nullable object', async () => {
      const source = `
        tool getUserName(user: { name: string } | null): string {
          if (user == null) {
            return "Unknown"
          }
          return user.name
        }
        
        result1 = getUserName({ name: "Alice" })
        print(result1)
        
        result2 = getUserName(null)
        print(result2)
      `;

      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('__buildZodSchema');

      await executeInVM(code, { timeout: 5000 });
      expect(consoleSpy).toHaveBeenCalledWith('Alice');
      expect(consoleSpy).toHaveBeenCalledWith('Unknown');
    });
  });

  describe('Multi-way Unions with Null', () => {
    it('should generate schema for multi-way union including null', async () => {
      const source = `
        tool processValue(value: string | number | null): string {
          if (value == null) {
            return "null"
          }
          return "Value: " + value
        }
        
        result1 = processValue("text")
        print(result1)
        
        result2 = processValue(42)
        print(result2)
        
        result3 = processValue(null)
        print(result3)
      `;

      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('__buildZodSchema');

      await executeInVM(code, { timeout: 5000 });
      expect(consoleSpy).toHaveBeenCalledWith('Value: text');
      expect(consoleSpy).toHaveBeenCalledWith('Value: 42');
      expect(consoleSpy).toHaveBeenCalledWith('null');
    });
  });

  describe('Nullable Return Types', () => {
    it('should accept nullable return type annotation', async () => {
      const source = `
        tool findUser(id: number): { name: string } | null {
          if (id == 1) {
            return { name: "Alice" }
          }
          return null
        }
        
        result1 = findUser(1)
        if (result1 != null) {
          print(result1.name)
        }
        
        result2 = findUser(2)
        if (result2 == null) {
          print("User not found")
        }
      `;

      const ast = parseSource(source);
      const code = generateCode(ast);

      // Return type is parsed but not included in schema
      expect(code).toContain('__buildZodSchema');

      await executeInVM(code, { timeout: 5000 });
      expect(consoleSpy).toHaveBeenCalledWith('Alice');
      expect(consoleSpy).toHaveBeenCalledWith('User not found');
    });
  });
});
