// E2E tests for type annotation schema generation
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { parseSource, generateCode } from '@mcpscript/transpiler';
import { executeInVM } from '@mcpscript/runtime';
import type { MockInstance } from 'vitest';
import { vi } from 'vitest';

describe('Type Annotation Schema E2E', () => {
  let consoleSpy: MockInstance;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('Schema Generation', () => {
    it('should generate schema for typed parameters', async () => {
      const source = `
        tool greet(name: string, age: number): string {
          return "Hello " + name + ", age " + age
        }
        
        result = greet("Alice", 30)
        print(result)
      `;

      const ast = parseSource(source);
      const code = generateCode(ast);

      // Check that __buildZodSchema is used
      expect(code).toContain('__buildZodSchema');
      expect(code).toContain('__createUserTool');

      // Tool should execute normally
      await executeInVM(code, { timeout: 5000 });
      expect(consoleSpy).toHaveBeenCalledWith('Hello Alice, age 30');
    });

    it('should generate schema with any type for unannotated parameters', async () => {
      const source = `
        tool process(data) {
          return "Data: " + data
        }
        
        result = process(42)
        print(result)
      `;

      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('__buildZodSchema');

      await executeInVM(code, { timeout: 5000 });
      expect(consoleSpy).toHaveBeenCalledWith('Data: 42');
    });

    it('should generate schema for optional parameters', async () => {
      const source = `
        tool greet(name: string, title?: string): string {
          if (title) {
            return "Hello " + title + " " + name
          }
          return "Hello " + name
        }
        
        result1 = greet("Smith", "Dr.")
        print(result1)
        
        result2 = greet("Alice")
        print(result2)
      `;

      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('__buildZodSchema');

      await executeInVM(code, { timeout: 5000 });
      expect(consoleSpy).toHaveBeenCalledWith('Hello Dr. Smith');
      expect(consoleSpy).toHaveBeenCalledWith('Hello Alice');
    });

    it('should generate schema for array types', async () => {
      const source = `
        tool sumArray(nums: number[]): number {
          total = 0
          for (i = 0; i < nums.length; i = i + 1) {
            total = total + nums[i]
          }
          return total
        }
        
        result = sumArray([1, 2, 3, 4, 5])
        print(result)
      `;

      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('__buildZodSchema');

      await executeInVM(code, { timeout: 5000 });
      expect(consoleSpy).toHaveBeenCalledWith(15);
    });

    it('should generate schema for union types', async () => {
      const source = `
        tool stringify(value: string | number): string {
          return "Value: " + value
        }
        
        result1 = stringify("hello")
        print(result1)
        
        result2 = stringify(42)
        print(result2)
      `;

      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('__buildZodSchema');

      await executeInVM(code, { timeout: 5000 });
      expect(consoleSpy).toHaveBeenCalledWith('Value: hello');
      expect(consoleSpy).toHaveBeenCalledWith('Value: 42');
    });

    it('should generate schema for object types', async () => {
      const source = `
        tool getUserInfo(user: { name: string, age: number }): string {
          return user.name + " is " + user.age + " years old"
        }
        
        result = getUserInfo({ name: "Alice", age: 30 })
        print(result)
      `;

      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('__buildZodSchema');

      await executeInVM(code, { timeout: 5000 });
      expect(consoleSpy).toHaveBeenCalledWith('Alice is 30 years old');
    });

    it('should generate schema for nullable types', async () => {
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
  });

  describe('Mixed Typed and Untyped Parameters', () => {
    it('should generate schema with typed and any parameters', async () => {
      const source = `
        tool process(name: string, data, count: number): string {
          return name + " " + data + " " + count
        }
        
        result = process("test", { anything: "goes" }, 42)
        print(result)
      `;

      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('__buildZodSchema');

      await executeInVM(code, { timeout: 5000 });
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('No Runtime Validation', () => {
    it('should execute tools without type checking (validation at MCP boundary)', async () => {
      const source = `
        tool greet(name: string): string {
          return "Hello " + name
        }
        
        // This works - no runtime validation in tool body
        result = greet(123)
        print(result)
      `;

      const ast = parseSource(source);
      const code = generateCode(ast);

      // Schema is generated for MCP registration
      expect(code).toContain('__buildZodSchema');

      // Tool executes without validation errors
      await executeInVM(code, { timeout: 5000 });
      expect(consoleSpy).toHaveBeenCalledWith('Hello 123');
    });
  });
});
