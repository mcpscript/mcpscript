import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import type {
  BinaryExpression,
  UnaryExpression,
  Assignment,
  Identifier,
} from '../../ast.js';

describe('Parser - Logical Operators', () => {
  describe('Binary logical operators', () => {
    it('should parse logical AND (&&)', () => {
      const statements = parseSource('result = a && b');
      expect(statements).toHaveLength(1);

      const assignment = statements[0] as Assignment;
      expect(assignment.type).toBe('assignment');
      expect((assignment.target as Identifier).name).toBe('result');

      const binary = assignment.value as BinaryExpression;
      expect(binary.type).toBe('binary');
      expect(binary.operator).toBe('&&');
      expect(binary.left).toEqual({ type: 'identifier', name: 'a' });
      expect(binary.right).toEqual({ type: 'identifier', name: 'b' });
    });

    it('should parse logical OR (||)', () => {
      const statements = parseSource('result = a || b');
      expect(statements).toHaveLength(1);

      const assignment = statements[0] as Assignment;
      const binary = assignment.value as BinaryExpression;
      expect(binary.type).toBe('binary');
      expect(binary.operator).toBe('||');
      expect(binary.left).toEqual({ type: 'identifier', name: 'a' });
      expect(binary.right).toEqual({ type: 'identifier', name: 'b' });
    });

    it('should parse logical operators with boolean literals', () => {
      const statements = parseSource('result = true && false');
      expect(statements).toHaveLength(1);

      const assignment = statements[0] as Assignment;
      const binary = assignment.value as BinaryExpression;
      expect(binary.type).toBe('binary');
      expect(binary.operator).toBe('&&');
      expect(binary.left).toEqual({ type: 'boolean', value: true });
      expect(binary.right).toEqual({ type: 'boolean', value: false });
    });
  });

  describe('Unary logical operators', () => {
    it('should parse logical NOT (!)', () => {
      const statements = parseSource('result = !condition');
      expect(statements).toHaveLength(1);

      const assignment = statements[0] as Assignment;
      const unary = assignment.value as UnaryExpression;
      expect(unary.type).toBe('unary');
      expect(unary.operator).toBe('!');
      expect(unary.operand).toEqual({ type: 'identifier', name: 'condition' });
    });

    it('should parse unary minus (-)', () => {
      const statements = parseSource('result = -value');
      expect(statements).toHaveLength(1);

      const assignment = statements[0] as Assignment;
      const unary = assignment.value as UnaryExpression;
      expect(unary.type).toBe('unary');
      expect(unary.operator).toBe('-');
      expect(unary.operand).toEqual({ type: 'identifier', name: 'value' });
    });

    it('should parse unary operators with literals', () => {
      const statements = parseSource('result = !true');
      expect(statements).toHaveLength(1);

      const assignment = statements[0] as Assignment;
      const unary = assignment.value as UnaryExpression;
      expect(unary.type).toBe('unary');
      expect(unary.operator).toBe('!');
      expect(unary.operand).toEqual({ type: 'boolean', value: true });
    });
  });

  describe('Operator precedence', () => {
    it('should handle AND having higher precedence than OR', () => {
      const statements = parseSource('result = a || b && c');
      expect(statements).toHaveLength(1);

      const assignment = statements[0] as Assignment;
      const orExpr = assignment.value as BinaryExpression;
      expect(orExpr.type).toBe('binary');
      expect(orExpr.operator).toBe('||');
      expect(orExpr.left).toEqual({ type: 'identifier', name: 'a' });

      // Right side should be AND expression
      const andExpr = orExpr.right as BinaryExpression;
      expect(andExpr.type).toBe('binary');
      expect(andExpr.operator).toBe('&&');
      expect(andExpr.left).toEqual({ type: 'identifier', name: 'b' });
      expect(andExpr.right).toEqual({ type: 'identifier', name: 'c' });
    });

    it('should handle unary operators with higher precedence', () => {
      const statements = parseSource('result = !condition || value');
      expect(statements).toHaveLength(1);

      const assignment = statements[0] as Assignment;
      const orExpr = assignment.value as BinaryExpression;
      expect(orExpr.type).toBe('binary');
      expect(orExpr.operator).toBe('||');

      // Left side should be unary expression
      const unaryExpr = orExpr.left as UnaryExpression;
      expect(unaryExpr.type).toBe('unary');
      expect(unaryExpr.operator).toBe('!');
      expect(unaryExpr.operand).toEqual({
        type: 'identifier',
        name: 'condition',
      });

      expect(orExpr.right).toEqual({ type: 'identifier', name: 'value' });
    });
  });

  describe('Mixed operators', () => {
    it('should parse arithmetic and logical operators together', () => {
      const statements = parseSource('result = x + y > 0 && z < 10');
      expect(statements).toHaveLength(1);

      const assignment = statements[0] as Assignment;
      const andExpr = assignment.value as BinaryExpression;
      expect(andExpr.type).toBe('binary');
      expect(andExpr.operator).toBe('&&');

      // Left side: x + y > 0
      const leftComparison = andExpr.left as BinaryExpression;
      expect(leftComparison.type).toBe('binary');
      expect(leftComparison.operator).toBe('>');

      const addExpr = leftComparison.left as BinaryExpression;
      expect(addExpr.type).toBe('binary');
      expect(addExpr.operator).toBe('+');

      // Right side: z < 10
      const rightComparison = andExpr.right as BinaryExpression;
      expect(rightComparison.type).toBe('binary');
      expect(rightComparison.operator).toBe('<');
    });

    it('should handle parentheses with logical operators', () => {
      const statements = parseSource('result = !(a == b) || c != d');
      expect(statements).toHaveLength(1);

      const assignment = statements[0] as Assignment;
      const orExpr = assignment.value as BinaryExpression;
      expect(orExpr.type).toBe('binary');
      expect(orExpr.operator).toBe('||');

      // Left side: !(a == b)
      const unaryExpr = orExpr.left as UnaryExpression;
      expect(unaryExpr.type).toBe('unary');
      expect(unaryExpr.operator).toBe('!');

      // The operand should be (a == b)
      const eqExpr = unaryExpr.operand as BinaryExpression;
      expect(eqExpr.type).toBe('binary');
      expect(eqExpr.operator).toBe('==');

      // Right side: c != d
      const neExpr = orExpr.right as BinaryExpression;
      expect(neExpr.type).toBe('binary');
      expect(neExpr.operator).toBe('!=');
    });
  });
});
