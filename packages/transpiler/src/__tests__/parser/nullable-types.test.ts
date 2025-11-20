// Parser tests for nullable types
import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import type { ToolDeclaration } from '../../ast.js';

describe('Nullable Type Parser', () => {
  it('should parse null as primitive type', () => {
    const source = 'tool test(value: null) { return value }';
    const ast = parseSource(source);
    const tool = ast[0] as ToolDeclaration;

    expect(tool.parameters[0].typeAnnotation).toEqual({
      type: 'primitive_type',
      value: 'null',
    });
  });

  it('should parse nullable string (string | null)', () => {
    const source = 'tool test(value: string | null) { return value }';
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
      value: 'null',
    });
  });

  it('should parse nullable number (number | null)', () => {
    const source = 'tool test(value: number | null) { return value }';
    const ast = parseSource(source);
    const tool = ast[0] as ToolDeclaration;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unionType = tool.parameters[0].typeAnnotation as any;
    expect(unionType.types[0].value).toBe('number');
    expect(unionType.types[1].value).toBe('null');
  });

  it('should parse nullable return type', () => {
    const source = 'tool test(): string | null { return null }';
    const ast = parseSource(source);
    const tool = ast[0] as ToolDeclaration;

    expect(tool.returnType?.type).toBe('union_type');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unionType = tool.returnType as any;
    expect(unionType.types).toHaveLength(2);
    expect(unionType.types[0].value).toBe('string');
    expect(unionType.types[1].value).toBe('null');
  });

  it('should parse null | string (order reversed)', () => {
    const source = 'tool test(value: null | string) { return value }';
    const ast = parseSource(source);
    const tool = ast[0] as ToolDeclaration;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unionType = tool.parameters[0].typeAnnotation as any;
    expect(unionType.types[0].value).toBe('null');
    expect(unionType.types[1].value).toBe('string');
  });

  it('should parse nullable array (string[] | null)', () => {
    const source = 'tool test(value: string[] | null) { return value }';
    const ast = parseSource(source);
    const tool = ast[0] as ToolDeclaration;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unionType = tool.parameters[0].typeAnnotation as any;
    expect(unionType.types).toHaveLength(2);
    expect(unionType.types[0].type).toBe('array_type');
    expect(unionType.types[1].value).toBe('null');
  });

  it('should parse nullable object', () => {
    const source = 'tool test(value: { name: string } | null) { return value }';
    const ast = parseSource(source);
    const tool = ast[0] as ToolDeclaration;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unionType = tool.parameters[0].typeAnnotation as any;
    expect(unionType.types).toHaveLength(2);
    expect(unionType.types[0].type).toBe('object_type');
    expect(unionType.types[1].value).toBe('null');
  });

  it('should parse multi-way union with null', () => {
    const source = 'tool test(value: string | number | null) { return value }';
    const ast = parseSource(source);
    const tool = ast[0] as ToolDeclaration;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unionType = tool.parameters[0].typeAnnotation as any;
    expect(unionType.types).toHaveLength(3);
    expect(unionType.types[0].value).toBe('string');
    expect(unionType.types[1].value).toBe('number');
    expect(unionType.types[2].value).toBe('null');
  });
});
