// Codegen tests for nullable types
import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import { generateCode } from '../../codegen.js';

describe('Nullable Type Codegen', () => {
  it('should generate schema for null type', () => {
    const source = 'tool test(value: null) { return value }';
    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain('value: { type: "null" }');
  });

  it('should generate schema for nullable string', () => {
    const source = 'tool test(value: string | null) { return value }';
    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain(
      'value: { type: "union", types: [{ type: "string" }, { type: "null" }] }'
    );
  });

  it('should generate schema for nullable number', () => {
    const source = 'tool test(value: number | null) { return value }';
    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain(
      'value: { type: "union", types: [{ type: "number" }, { type: "null" }] }'
    );
  });

  it('should generate schema for nullable return type', () => {
    const source = 'tool test(): string | null { return null }';
    const ast = parseSource(source);
    const code = generateCode(ast);

    // Return types are parsed but not included in schema
    expect(code).toContain('__buildZodSchema');
    expect(code).toContain('__createUserTool');
  });

  it('should generate schema for nullable array', () => {
    const source = 'tool test(items: string[] | null) { return items }';
    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain(
      'items: { type: "union", types: [{ type: "array", elementType: { type: "string" } }, { type: "null" }] }'
    );
  });

  it('should generate schema for nullable object', () => {
    const source = 'tool test(user: { name: string } | null) { return user }';
    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain(
      'user: { type: "union", types: [{ type: "object", properties: { name: { type: "string" } } }, { type: "null" }] }'
    );
  });

  it('should generate schema for three-way union with null', () => {
    const source = 'tool test(value: string | number | null) { return value }';
    const ast = parseSource(source);
    const code = generateCode(ast);

    expect(code).toContain(
      'value: { type: "union", types: [{ type: "string" }, { type: "number" }, { type: "null" }] }'
    );
  });
});
