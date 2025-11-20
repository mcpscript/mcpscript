// Codegen tests for type validation
import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import { generateCode } from '../../codegen.js';

describe('Type Validation Codegen', () => {
  describe('Tools Without Type Annotations', () => {
    it('should generate tool with any type schema for unannotated parameters', () => {
      const source = 'tool test(name, age) { return name }';
      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('__createUserTool');
      expect(code).toContain('__buildZodSchema');
      expect(code).toContain('name: { type: "any" }');
      expect(code).toContain('age: { type: "any" }');
    });
  });

  describe('Parameter Type Validation', () => {
    it('should generate schema for string parameter', () => {
      const source = 'tool test(name: string) { return name }';
      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('__buildZodSchema');
      expect(code).toContain('name: { type: "string" }');
    });

    it('should generate schema for multiple typed parameters', () => {
      const source =
        'tool test(name: string, age: number, active: boolean) { return name }';
      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('name: { type: "string" }');
      expect(code).toContain('age: { type: "number" }');
      expect(code).toContain('active: { type: "boolean" }');
    });

    it('should generate schema for optional parameter', () => {
      const source = 'tool test(name: string, title?: string) { return name }';
      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('name: { type: "string" }');
      expect(code).toContain(
        'title: { type: "optional", schema: { type: "string" } }'
      );
    });

    it('should generate schema for array parameter', () => {
      const source = 'tool test(items: string[]) { return items }';
      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain(
        'items: { type: "array", elementType: { type: "string" } }'
      );
    });

    it('should generate schema for union type', () => {
      const source = 'tool test(value: string | number) { return value }';
      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain(
        'value: { type: "union", types: [{ type: "string" }, { type: "number" }] }'
      );
    });

    it('should generate schema for object type', () => {
      const source =
        'tool test(user: { name: string, age: number }) { return user }';
      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain(
        'user: { type: "object", properties: { name: { type: "string" }, age: { type: "number" } } }'
      );
    });

    it('should generate schema for object with optional property', () => {
      const source =
        'tool test(user: { name: string, age?: number }) { return user }';
      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('name: { type: "string" }');
      expect(code).toContain(
        'age: { type: "optional", schema: { type: "number" } }'
      );
    });
  });

  describe('Return Type Annotations', () => {
    it('should accept return type annotation (parsed but not used for schema)', () => {
      const source = 'tool test(): string { return "hello" }';
      const ast = parseSource(source);
      const code = generateCode(ast);

      // Return types are parsed but not included in the schema
      // Schema only contains parameter types for MCP tool registration
      expect(code).toContain('__buildZodSchema');
      expect(code).toContain('__createUserTool');
    });

    it('should accept array return type annotation', () => {
      const source = 'tool test(): number[] { return [1, 2, 3] }';
      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('__buildZodSchema');
    });

    it('should accept union return type annotation', () => {
      const source = 'tool test(): string | number { return 42 }';
      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('__buildZodSchema');
    });
  });

  describe('Combined Parameter and Return Type Annotations', () => {
    it('should generate parameter schema with return type annotation', () => {
      const source = 'tool test(name: string): string { return name }';
      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('__buildZodSchema');
      expect(code).toContain('name: { type: "string" }');
    });
  });

  describe('Complex Types', () => {
    it('should generate schema for nested arrays', () => {
      const source = 'tool test(matrix: number[][]) { return matrix }';
      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain(
        'matrix: { type: "array", elementType: { type: "array", elementType: { type: "number" } } }'
      );
    });

    it('should generate schema for any type', () => {
      const source = 'tool test(data: any): any { return data }';
      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('data: { type: "any" }');
    });
  });

  describe('Mixed Typed and Untyped Parameters', () => {
    it('should validate typed parameters with their types and untyped as any', () => {
      const source =
        'tool test(name: string, data, count: number) { return name }';
      const ast = parseSource(source);
      const code = generateCode(ast);

      expect(code).toContain('name: { type: "string" }');
      expect(code).toContain('count: { type: "number" }');
      // data should be validated as 'any' type
      expect(code).toContain('data: { type: "any" }');
    });
  });
});
