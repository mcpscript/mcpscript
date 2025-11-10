import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import type {
  BinaryExpression,
  UnaryExpression,
  Assignment,
  CallExpression,
  MemberExpression,
} from '../../ast.js';

describe('Parser - Operator Precedence', () => {
  describe('Arithmetic operator precedence', () => {
    it('should handle multiplication before addition (2 + 3 * 4 = 2 + (3 * 4))', () => {
      const statements = parseSource('result = 2 + 3 * 4');
      expect(statements).toHaveLength(1);

      const assignment = statements[0] as Assignment;
      const binary = assignment.value as BinaryExpression;

      expect(binary.operator).toBe('+');
      expect(binary.left).toEqual({ type: 'number', value: 2 });

      const rightSide = binary.right as BinaryExpression;
      expect(rightSide.type).toBe('binary');
      expect(rightSide.operator).toBe('*');
      expect(rightSide.left).toEqual({ type: 'number', value: 3 });
      expect(rightSide.right).toEqual({ type: 'number', value: 4 });
    });

    it('should handle division before subtraction (10 - 6 / 2 = 10 - (6 / 2))', () => {
      const statements = parseSource('result = 10 - 6 / 2');
      const assignment = statements[0] as Assignment;
      const binary = assignment.value as BinaryExpression;

      expect(binary.operator).toBe('-');
      expect(binary.left).toEqual({ type: 'number', value: 10 });

      const rightSide = binary.right as BinaryExpression;
      expect(rightSide.operator).toBe('/');
      expect(rightSide.left).toEqual({ type: 'number', value: 6 });
      expect(rightSide.right).toEqual({ type: 'number', value: 2 });
    });

    it('should handle modulo with same precedence as multiplication', () => {
      const statements = parseSource('result = a + b % c');
      const assignment = statements[0] as Assignment;
      const binary = assignment.value as BinaryExpression;

      expect(binary.operator).toBe('+');
      const rightSide = binary.right as BinaryExpression;
      expect(rightSide.operator).toBe('%');
    });
  });

  describe('Comparison operator precedence', () => {
    it('should handle arithmetic before comparison (x + y > z = (x + y) > z)', () => {
      const statements = parseSource('result = x + y > z');
      const assignment = statements[0] as Assignment;
      const binary = assignment.value as BinaryExpression;

      expect(binary.operator).toBe('>');
      const leftSide = binary.left as BinaryExpression;
      expect(leftSide.operator).toBe('+');
      expect(leftSide.left).toEqual({ type: 'identifier', name: 'x' });
      expect(leftSide.right).toEqual({ type: 'identifier', name: 'y' });
      expect(binary.right).toEqual({ type: 'identifier', name: 'z' });
    });

    it('should handle all comparison operators with same precedence', () => {
      const operators = ['==', '!=', '<', '>', '<=', '>='];
      for (const op of operators) {
        const statements = parseSource(`result = a + b ${op} c`);
        const assignment = statements[0] as Assignment;
        const binary = assignment.value as BinaryExpression;

        expect(binary.operator).toBe(op);
        const leftSide = binary.left as BinaryExpression;
        expect(leftSide.operator).toBe('+');
      }
    });
  });

  describe('Logical operator precedence', () => {
    it('should handle AND before OR (a || b && c = a || (b && c))', () => {
      const statements = parseSource('result = a || b && c');
      const assignment = statements[0] as Assignment;
      const binary = assignment.value as BinaryExpression;

      expect(binary.operator).toBe('||');
      expect(binary.left).toEqual({ type: 'identifier', name: 'a' });

      const rightSide = binary.right as BinaryExpression;
      expect(rightSide.operator).toBe('&&');
      expect(rightSide.left).toEqual({ type: 'identifier', name: 'b' });
      expect(rightSide.right).toEqual({ type: 'identifier', name: 'c' });
    });

    it('should handle comparison before logical AND', () => {
      const statements = parseSource('result = x > 0 && y < 10');
      const assignment = statements[0] as Assignment;
      const binary = assignment.value as BinaryExpression;

      expect(binary.operator).toBe('&&');
      const leftSide = binary.left as BinaryExpression;
      expect(leftSide.operator).toBe('>');
      const rightSide = binary.right as BinaryExpression;
      expect(rightSide.operator).toBe('<');
    });
  });

  describe('Unary operator precedence', () => {
    it('should handle unary operators before binary operators', () => {
      const statements = parseSource('result = !flag && value');
      const assignment = statements[0] as Assignment;
      const binary = assignment.value as BinaryExpression;

      expect(binary.operator).toBe('&&');
      const leftSide = binary.left as UnaryExpression;
      expect(leftSide.type).toBe('unary');
      expect(leftSide.operator).toBe('!');
      expect(leftSide.operand).toEqual({ type: 'identifier', name: 'flag' });
    });

    it('should handle unary minus before multiplication', () => {
      const statements = parseSource('result = -x * y');
      const assignment = statements[0] as Assignment;
      const binary = assignment.value as BinaryExpression;

      expect(binary.operator).toBe('*');
      const leftSide = binary.left as UnaryExpression;
      expect(leftSide.type).toBe('unary');
      expect(leftSide.operator).toBe('-');
      expect(leftSide.operand).toEqual({ type: 'identifier', name: 'x' });
    });
  });

  describe('Member expression and function call precedence', () => {
    it('should handle member expressions before arithmetic', () => {
      const statements = parseSource('result = obj.prop + value');
      const assignment = statements[0] as Assignment;
      const binary = assignment.value as BinaryExpression;

      expect(binary.operator).toBe('+');
      const leftSide = binary.left as MemberExpression;
      expect(leftSide.type).toBe('member');
      expect(leftSide.object).toEqual({ type: 'identifier', name: 'obj' });
      expect(leftSide.property).toBe('prop');
    });

    it('should handle function calls before arithmetic', () => {
      const statements = parseSource('result = func() + 10');
      const assignment = statements[0] as Assignment;
      const binary = assignment.value as BinaryExpression;

      expect(binary.operator).toBe('+');
      const leftSide = binary.left as CallExpression;
      expect(leftSide.type).toBe('call');
      expect(leftSide.callee).toEqual({ type: 'identifier', name: 'func' });
    });

    it('should handle chained member expressions', () => {
      const statements = parseSource('result = obj.method().prop + 5');
      const assignment = statements[0] as Assignment;
      const binary = assignment.value as BinaryExpression;

      expect(binary.operator).toBe('+');
      const leftSide = binary.left as MemberExpression;
      expect(leftSide.type).toBe('member');

      // The object should be a function call
      const callExpr = leftSide.object as CallExpression;
      expect(callExpr.type).toBe('call');

      // The function being called should be obj.method
      const memberExpr = callExpr.callee as MemberExpression;
      expect(memberExpr.type).toBe('member');
      expect(memberExpr.object).toEqual({ type: 'identifier', name: 'obj' });
      expect(memberExpr.property).toBe('method');
    });
  });

  describe('Complex precedence scenarios', () => {
    it('should handle mixed operators with correct precedence', () => {
      // result = a + b > c * d || e && f
      // Should parse as: ((a + b) > (c * d)) || (e && f)
      const statements = parseSource('result = a + b > c * d || e && f');
      const assignment = statements[0] as Assignment;
      const orExpr = assignment.value as BinaryExpression;

      expect(orExpr.operator).toBe('||');

      // Left side: (a + b) > (c * d)
      const leftComparison = orExpr.left as BinaryExpression;
      expect(leftComparison.operator).toBe('>');

      const addExpr = leftComparison.left as BinaryExpression;
      expect(addExpr.operator).toBe('+');

      const mulExpr = leftComparison.right as BinaryExpression;
      expect(mulExpr.operator).toBe('*');

      // Right side: e && f
      const andExpr = orExpr.right as BinaryExpression;
      expect(andExpr.operator).toBe('&&');
    });

    it('should handle parentheses overriding precedence', () => {
      const statements = parseSource('result = (a + b) * c');
      const assignment = statements[0] as Assignment;
      const binary = assignment.value as BinaryExpression;

      expect(binary.operator).toBe('*');
      // Left side should be a parenthesized expression containing addition
      expect(binary.left.type).toBe('binary');
      const leftSide = binary.left as BinaryExpression;
      expect(leftSide.operator).toBe('+');
    });

    it('should handle nested function calls and member expressions', () => {
      const statements = parseSource('result = obj.func(arg).prop * 2');
      const assignment = statements[0] as Assignment;
      const binary = assignment.value as BinaryExpression;

      expect(binary.operator).toBe('*');

      // Left side: obj.func(arg).prop
      const memberExpr = binary.left as MemberExpression;
      expect(memberExpr.type).toBe('member');
      expect(memberExpr.property).toBe('prop');

      // Object should be obj.func(arg)
      const callExpr = memberExpr.object as CallExpression;
      expect(callExpr.type).toBe('call');

      // Function should be obj.func
      const funcMemberExpr = callExpr.callee as MemberExpression;
      expect(funcMemberExpr.type).toBe('member');
      expect(funcMemberExpr.object).toEqual({
        type: 'identifier',
        name: 'obj',
      });
      expect(funcMemberExpr.property).toBe('func');
    });
  });
});
