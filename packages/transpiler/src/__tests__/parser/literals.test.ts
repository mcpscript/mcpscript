// Parser tests for literals
import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import {
  Assignment,
  StringLiteral,
  NumberLiteral,
  BooleanLiteral,
  ArrayLiteral,
  ObjectLiteral,
} from '../../ast.js';

describe('Parser - Literals', () => {
  describe('String Literals', () => {
    it('should parse string literals', () => {
      const statements = parseSource('x = "hello world"');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      expect(stmt.type).toBe('assignment');
      expect(stmt.variable).toBe('x');
      expect((stmt.value as StringLiteral).value).toBe('hello world');
    });

    it('should parse single-quoted strings', () => {
      const statements = parseSource("x = 'hello'");
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      expect((stmt.value as StringLiteral).value).toBe('hello');
    });

    it('should parse string escape sequences', () => {
      const statements = parseSource('x = "line1\\nline2\\ttab"');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      expect((stmt.value as StringLiteral).value).toBe('line1\nline2\ttab');
    });
  });

  describe('Number Literals', () => {
    it('should parse number literals', () => {
      const statements = parseSource('x = 42');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      expect(stmt.type).toBe('assignment');
      expect((stmt.value as NumberLiteral).value).toBe(42);
    });

    it('should parse float literals', () => {
      const statements = parseSource('x = 3.14');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      expect((stmt.value as NumberLiteral).value).toBe(3.14);
    });

    it('should parse decimal literals starting with dot', () => {
      const statements = parseSource('x = .5');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      expect((stmt.value as NumberLiteral).value).toBe(0.5);
    });

    it('should parse scientific notation with lowercase e', () => {
      const statements = parseSource(
        'large = 1e5\nsmall = 2.5e-3\nprecise = 6.022e23'
      );
      expect(statements).toHaveLength(3);
      expect((statements[0] as Assignment).value).toEqual({
        type: 'number',
        value: 1e5,
      });
      expect((statements[1] as Assignment).value).toEqual({
        type: 'number',
        value: 2.5e-3,
      });
      expect((statements[2] as Assignment).value).toEqual({
        type: 'number',
        value: 6.022e23,
      });
    });

    it('should parse scientific notation with uppercase E', () => {
      const statements = parseSource(
        'large = 1E5\npositive = 1.23E+10\nnegative = 4.56E-7'
      );
      expect(statements).toHaveLength(3);
      expect((statements[0] as Assignment).value).toEqual({
        type: 'number',
        value: 1e5,
      });
      expect((statements[1] as Assignment).value).toEqual({
        type: 'number',
        value: 1.23e10,
      });
      expect((statements[2] as Assignment).value).toEqual({
        type: 'number',
        value: 4.56e-7,
      });
    });

    it('should parse zero in different formats', () => {
      const statements = parseSource(
        'zero1 = 0\nzero2 = 0.0\nzero3 = .0\nzero4 = 0e0'
      );
      expect(statements).toHaveLength(4);
      expect((statements[0] as Assignment).value).toEqual({
        type: 'number',
        value: 0,
      });
      expect((statements[1] as Assignment).value).toEqual({
        type: 'number',
        value: 0.0,
      });
      expect((statements[2] as Assignment).value).toEqual({
        type: 'number',
        value: 0.0,
      });
      expect((statements[3] as Assignment).value).toEqual({
        type: 'number',
        value: 0,
      });
    });
  });

  describe('Boolean Literals', () => {
    it('should parse boolean literals', () => {
      const statements = parseSource('x = true\ny = false');
      expect(statements).toHaveLength(2);
      expect((statements[0] as Assignment).value).toEqual({
        type: 'boolean',
        value: true,
      });
      expect((statements[1] as Assignment).value).toEqual({
        type: 'boolean',
        value: false,
      });
    });
  });

  describe('Array Literals', () => {
    it('should parse array literals', () => {
      const statements = parseSource('x = ["a", "b", "c"]');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const arr = stmt.value as ArrayLiteral;
      expect(arr.type).toBe('array');
      expect(arr.elements).toHaveLength(3);
      expect((arr.elements[0] as StringLiteral).value).toBe('a');
      expect((arr.elements[1] as StringLiteral).value).toBe('b');
      expect((arr.elements[2] as StringLiteral).value).toBe('c');
    });

    it('should parse mixed array literals', () => {
      const statements = parseSource('x = ["string", 42, true]');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const arr = stmt.value as ArrayLiteral;
      expect(arr.elements).toHaveLength(3);
      expect((arr.elements[0] as StringLiteral).value).toBe('string');
      expect((arr.elements[1] as NumberLiteral).value).toBe(42);
      expect((arr.elements[2] as BooleanLiteral).value).toBe(true);
    });

    it('should parse empty array literals', () => {
      const statements = parseSource('x = []');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const arr = stmt.value as ArrayLiteral;
      expect(arr.type).toBe('array');
      expect(arr.elements).toHaveLength(0);
    });
  });

  describe('Object Literals', () => {
    it('should parse object literals', () => {
      const statements = parseSource('x = { a: "hello", b: 42 }');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const obj = stmt.value as ObjectLiteral;
      expect(obj.type).toBe('object');
      expect(obj.properties).toHaveLength(2);
      expect(obj.properties[0].key).toBe('a');
      expect((obj.properties[0].value as StringLiteral).value).toBe('hello');
      expect(obj.properties[1].key).toBe('b');
      expect((obj.properties[1].value as NumberLiteral).value).toBe(42);
    });

    it('should parse empty object literals', () => {
      const statements = parseSource('x = {}');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const obj = stmt.value as ObjectLiteral;
      expect(obj.type).toBe('object');
      expect(obj.properties).toHaveLength(0);
    });

    it('should parse nested object literals', () => {
      const statements = parseSource('x = { nested: { value: 42 } }');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const obj = stmt.value as ObjectLiteral;
      expect(obj.properties).toHaveLength(1);
      expect(obj.properties[0].key).toBe('nested');
      const nested = obj.properties[0].value as ObjectLiteral;
      expect(nested.type).toBe('object');
      expect(nested.properties[0].key).toBe('value');
      expect((nested.properties[0].value as NumberLiteral).value).toBe(42);
    });
  });
});
