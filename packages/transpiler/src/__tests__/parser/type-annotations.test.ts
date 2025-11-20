// Parser tests for type annotations in tool declarations
import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import type { ToolDeclaration } from '../../ast.js';

describe('Type Annotation Parser', () => {
  describe('Primitive Types', () => {
    it('should parse string type annotation', () => {
      const source = 'tool test(name: string) { return name }';
      const ast = parseSource(source);
      const tool = ast[0] as ToolDeclaration;

      expect(tool.parameters).toHaveLength(1);
      expect(tool.parameters[0].name).toBe('name');
      expect(tool.parameters[0].typeAnnotation).toEqual({
        type: 'primitive_type',
        value: 'string',
      });
    });

    it('should parse number type annotation', () => {
      const source = 'tool test(count: number) { return count }';
      const ast = parseSource(source);
      const tool = ast[0] as ToolDeclaration;

      expect(tool.parameters[0].typeAnnotation).toEqual({
        type: 'primitive_type',
        value: 'number',
      });
    });

    it('should parse boolean type annotation', () => {
      const source = 'tool test(flag: boolean) { return flag }';
      const ast = parseSource(source);
      const tool = ast[0] as ToolDeclaration;

      expect(tool.parameters[0].typeAnnotation).toEqual({
        type: 'primitive_type',
        value: 'boolean',
      });
    });

    it('should parse any type annotation', () => {
      const source = 'tool test(data: any) { return data }';
      const ast = parseSource(source);
      const tool = ast[0] as ToolDeclaration;

      expect(tool.parameters[0].typeAnnotation).toEqual({
        type: 'primitive_type',
        value: 'any',
      });
    });
  });

  describe('Optional Parameters', () => {
    it('should parse optional parameter without type', () => {
      const source = 'tool test(name?) { return name }';
      const ast = parseSource(source);
      const tool = ast[0] as ToolDeclaration;

      expect(tool.parameters[0].name).toBe('name');
      expect(tool.parameters[0].optional).toBe(true);
      expect(tool.parameters[0].typeAnnotation).toBeUndefined();
    });

    it('should parse optional parameter with type', () => {
      const source = 'tool test(name?: string) { return name }';
      const ast = parseSource(source);
      const tool = ast[0] as ToolDeclaration;

      expect(tool.parameters[0].name).toBe('name');
      expect(tool.parameters[0].optional).toBe(true);
      expect(tool.parameters[0].typeAnnotation).toEqual({
        type: 'primitive_type',
        value: 'string',
      });
    });
  });

  describe('Array Types', () => {
    it('should parse string array type', () => {
      const source = 'tool test(items: string[]) { return items }';
      const ast = parseSource(source);
      const tool = ast[0] as ToolDeclaration;

      expect(tool.parameters[0].typeAnnotation).toEqual({
        type: 'array_type',
        elementType: {
          type: 'primitive_type',
          value: 'string',
        },
      });
    });

    it('should parse number array type', () => {
      const source = 'tool test(nums: number[]) { return nums }';
      const ast = parseSource(source);
      const tool = ast[0] as ToolDeclaration;

      expect(tool.parameters[0].typeAnnotation).toEqual({
        type: 'array_type',
        elementType: {
          type: 'primitive_type',
          value: 'number',
        },
      });
    });

    it('should parse nested array type', () => {
      const source = 'tool test(matrix: number[][]) { return matrix }';
      const ast = parseSource(source);
      const tool = ast[0] as ToolDeclaration;

      expect(tool.parameters[0].typeAnnotation).toEqual({
        type: 'array_type',
        elementType: {
          type: 'array_type',
          elementType: {
            type: 'primitive_type',
            value: 'number',
          },
        },
      });
    });
  });

  describe('Union Types', () => {
    it('should parse string | number union', () => {
      const source = 'tool test(value: string | number) { return value }';
      const ast = parseSource(source);
      const tool = ast[0] as ToolDeclaration;

      expect(tool.parameters[0].typeAnnotation?.type).toBe('union_type');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unionType = tool.parameters[0].typeAnnotation as any;
      expect(unionType.types).toHaveLength(2);
      expect(unionType.types[0]).toEqual({
        type: 'primitive_type',
        value: 'string',
      });
      expect(unionType.types[1]).toEqual({
        type: 'primitive_type',
        value: 'number',
      });
    });

    it('should parse three-way union', () => {
      const source =
        'tool test(value: string | number | boolean) { return value }';
      const ast = parseSource(source);
      const tool = ast[0] as ToolDeclaration;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unionType = tool.parameters[0].typeAnnotation as any;
      expect(unionType.types).toHaveLength(3);
    });
  });

  describe('Object Types', () => {
    it('should parse simple object type', () => {
      const source =
        'tool test(user: { name: string, age: number }) { return user }';
      const ast = parseSource(source);
      const tool = ast[0] as ToolDeclaration;

      expect(tool.parameters[0].typeAnnotation).toEqual({
        type: 'object_type',
        properties: [
          {
            name: 'name',
            optional: false,
            typeAnnotation: { type: 'primitive_type', value: 'string' },
          },
          {
            name: 'age',
            optional: false,
            typeAnnotation: { type: 'primitive_type', value: 'number' },
          },
        ],
      });
    });

    it('should parse object type with optional property', () => {
      const source =
        'tool test(user: { name: string, age?: number }) { return user }';
      const ast = parseSource(source);
      const tool = ast[0] as ToolDeclaration;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const objType = tool.parameters[0].typeAnnotation as any;
      expect(objType.properties[0].optional).toBe(false);
      expect(objType.properties[1].optional).toBe(true);
    });

    it('should parse object type with trailing comma', () => {
      const source =
        'tool test(user: { name: string, age: number, }) { return user }';
      const ast = parseSource(source);
      const tool = ast[0] as ToolDeclaration;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const objType = tool.parameters[0].typeAnnotation as any;
      expect(objType.properties).toHaveLength(2);
    });
  });

  describe('Return Type Annotations', () => {
    it('should parse string return type', () => {
      const source = 'tool test(): string { return "hello" }';
      const ast = parseSource(source);
      const tool = ast[0] as ToolDeclaration;

      expect(tool.returnType).toEqual({
        type: 'primitive_type',
        value: 'string',
      });
    });

    it('should parse array return type', () => {
      const source = 'tool test(): number[] { return [1, 2, 3] }';
      const ast = parseSource(source);
      const tool = ast[0] as ToolDeclaration;

      expect(tool.returnType).toEqual({
        type: 'array_type',
        elementType: {
          type: 'primitive_type',
          value: 'number',
        },
      });
    });

    it('should parse union return type', () => {
      const source = 'tool test(): string | number { return 42 }';
      const ast = parseSource(source);
      const tool = ast[0] as ToolDeclaration;

      expect(tool.returnType?.type).toBe('union_type');
    });
  });

  describe('Multiple Parameters', () => {
    it('should parse multiple typed parameters', () => {
      const source =
        'tool test(name: string, age: number, active: boolean) { return name }';
      const ast = parseSource(source);
      const tool = ast[0] as ToolDeclaration;

      expect(tool.parameters).toHaveLength(3);
      expect(tool.parameters[0].name).toBe('name');
      expect(tool.parameters[1].name).toBe('age');
      expect(tool.parameters[2].name).toBe('active');
    });

    it('should parse mix of typed and untyped parameters', () => {
      const source =
        'tool test(name: string, data, count: number) { return name }';
      const ast = parseSource(source);
      const tool = ast[0] as ToolDeclaration;

      expect(tool.parameters[0].typeAnnotation).toBeDefined();
      expect(tool.parameters[1].typeAnnotation).toBeUndefined();
      expect(tool.parameters[2].typeAnnotation).toBeDefined();
    });

    it('should parse with trailing comma', () => {
      const source = 'tool test(name: string, age: number,) { return name }';
      const ast = parseSource(source);
      const tool = ast[0] as ToolDeclaration;

      expect(tool.parameters).toHaveLength(2);
    });
  });

  describe('No Type Annotations', () => {
    it('should parse tool without any type annotations', () => {
      const source = 'tool test(name, age) { return name }';
      const ast = parseSource(source);
      const tool = ast[0] as ToolDeclaration;

      expect(tool.parameters[0].typeAnnotation).toBeUndefined();
      expect(tool.parameters[1].typeAnnotation).toBeUndefined();
      expect(tool.returnType).toBeUndefined();
    });
  });
});
