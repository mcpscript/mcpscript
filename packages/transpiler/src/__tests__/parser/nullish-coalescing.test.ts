import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import type { BinaryExpression, Assignment, Identifier } from '../../ast.js';

describe('Parser - Nullish Coalescing Operator', () => {
  describe('Basic nullish coalescing', () => {
    it('should parse nullish coalescing operator (??)', () => {
      const statements = parseSource('result = a ?? b');
      expect(statements).toHaveLength(1);

      const assignment = statements[0] as Assignment;
      expect(assignment.type).toBe('assignment');
      expect((assignment.target as Identifier).name).toBe('result');

      const binary = assignment.value as BinaryExpression;
      expect(binary.type).toBe('binary');
      expect(binary.operator).toBe('??');
      expect(binary.left).toEqual({ type: 'identifier', name: 'a' });
      expect(binary.right).toEqual({ type: 'identifier', name: 'b' });
    });

    it('should parse nullish coalescing with literals', () => {
      const statements = parseSource('result = value ?? 0');
      expect(statements).toHaveLength(1);

      const assignment = statements[0] as Assignment;
      const binary = assignment.value as BinaryExpression;
      expect(binary.type).toBe('binary');
      expect(binary.operator).toBe('??');
      expect(binary.left).toEqual({ type: 'identifier', name: 'value' });
      expect(binary.right).toEqual({ type: 'number', value: 0 });
    });

    it('should parse nullish coalescing with string literals', () => {
      const statements = parseSource('result = name ?? "default"');
      expect(statements).toHaveLength(1);

      const assignment = statements[0] as Assignment;
      const binary = assignment.value as BinaryExpression;
      expect(binary.type).toBe('binary');
      expect(binary.operator).toBe('??');
      expect(binary.left).toEqual({ type: 'identifier', name: 'name' });
      expect(binary.right).toEqual({ type: 'string', value: 'default' });
    });
  });

  describe('Chained nullish coalescing', () => {
    it('should parse chained nullish coalescing (left-associative)', () => {
      const statements = parseSource('result = a ?? b ?? c');
      expect(statements).toHaveLength(1);

      const assignment = statements[0] as Assignment;
      const rightOp = assignment.value as BinaryExpression;
      expect(rightOp.type).toBe('binary');
      expect(rightOp.operator).toBe('??');

      // Left side should be (a ?? b)
      const leftOp = rightOp.left as BinaryExpression;
      expect(leftOp.type).toBe('binary');
      expect(leftOp.operator).toBe('??');
      expect(leftOp.left).toEqual({ type: 'identifier', name: 'a' });
      expect(leftOp.right).toEqual({ type: 'identifier', name: 'b' });

      // Right side should be c
      expect(rightOp.right).toEqual({ type: 'identifier', name: 'c' });
    });

    it('should parse multiple nullish coalescing with default values', () => {
      const statements = parseSource(
        'result = primary ?? secondary ?? "fallback"'
      );
      expect(statements).toHaveLength(1);

      const assignment = statements[0] as Assignment;
      const rightOp = assignment.value as BinaryExpression;
      expect(rightOp.type).toBe('binary');
      expect(rightOp.operator).toBe('??');

      const leftOp = rightOp.left as BinaryExpression;
      expect(leftOp.type).toBe('binary');
      expect(leftOp.operator).toBe('??');
      expect(leftOp.left).toEqual({ type: 'identifier', name: 'primary' });
      expect(leftOp.right).toEqual({ type: 'identifier', name: 'secondary' });

      expect(rightOp.right).toEqual({ type: 'string', value: 'fallback' });
    });
  });

  describe('Operator precedence with ??', () => {
    it('should have ?? with lower precedence than ||', () => {
      const statements = parseSource('result = a ?? b || c');
      expect(statements).toHaveLength(1);

      const assignment = statements[0] as Assignment;
      const coalesceExpr = assignment.value as BinaryExpression;
      expect(coalesceExpr.type).toBe('binary');
      expect(coalesceExpr.operator).toBe('??');
      expect(coalesceExpr.left).toEqual({ type: 'identifier', name: 'a' });

      // Right side should be (b || c)
      const orExpr = coalesceExpr.right as BinaryExpression;
      expect(orExpr.type).toBe('binary');
      expect(orExpr.operator).toBe('||');
      expect(orExpr.left).toEqual({ type: 'identifier', name: 'b' });
      expect(orExpr.right).toEqual({ type: 'identifier', name: 'c' });
    });

    it('should have ?? with lower precedence than &&', () => {
      const statements = parseSource('result = a ?? b && c');
      expect(statements).toHaveLength(1);

      const assignment = statements[0] as Assignment;
      const coalesceExpr = assignment.value as BinaryExpression;
      expect(coalesceExpr.type).toBe('binary');
      expect(coalesceExpr.operator).toBe('??');
      expect(coalesceExpr.left).toEqual({ type: 'identifier', name: 'a' });

      // Right side should be (b && c)
      const andExpr = coalesceExpr.right as BinaryExpression;
      expect(andExpr.type).toBe('binary');
      expect(andExpr.operator).toBe('&&');
      expect(andExpr.left).toEqual({ type: 'identifier', name: 'b' });
      expect(andExpr.right).toEqual({ type: 'identifier', name: 'c' });
    });

    it('should have ?? with lower precedence than comparison operators', () => {
      const statements = parseSource('result = a ?? b > 0');
      expect(statements).toHaveLength(1);

      const assignment = statements[0] as Assignment;
      const coalesceExpr = assignment.value as BinaryExpression;
      expect(coalesceExpr.type).toBe('binary');
      expect(coalesceExpr.operator).toBe('??');
      expect(coalesceExpr.left).toEqual({ type: 'identifier', name: 'a' });

      // Right side should be (b > 0)
      const compExpr = coalesceExpr.right as BinaryExpression;
      expect(compExpr.type).toBe('binary');
      expect(compExpr.operator).toBe('>');
      expect(compExpr.left).toEqual({ type: 'identifier', name: 'b' });
      expect(compExpr.right).toEqual({ type: 'number', value: 0 });
    });

    it('should have ?? with lower precedence than arithmetic operators', () => {
      const statements = parseSource('result = a ?? b + 1');
      expect(statements).toHaveLength(1);

      const assignment = statements[0] as Assignment;
      const coalesceExpr = assignment.value as BinaryExpression;
      expect(coalesceExpr.type).toBe('binary');
      expect(coalesceExpr.operator).toBe('??');
      expect(coalesceExpr.left).toEqual({ type: 'identifier', name: 'a' });

      // Right side should be (b + 1)
      const addExpr = coalesceExpr.right as BinaryExpression;
      expect(addExpr.type).toBe('binary');
      expect(addExpr.operator).toBe('+');
      expect(addExpr.left).toEqual({ type: 'identifier', name: 'b' });
      expect(addExpr.right).toEqual({ type: 'number', value: 1 });
    });
  });

  describe('Mixed operators with ??', () => {
    it('should parse ?? with || on the left', () => {
      const statements = parseSource('result = a || b ?? c');
      expect(statements).toHaveLength(1);

      const assignment = statements[0] as Assignment;
      const coalesceExpr = assignment.value as BinaryExpression;
      expect(coalesceExpr.type).toBe('binary');
      expect(coalesceExpr.operator).toBe('??');

      // Left side should be (a || b)
      const orExpr = coalesceExpr.left as BinaryExpression;
      expect(orExpr.type).toBe('binary');
      expect(orExpr.operator).toBe('||');
      expect(orExpr.left).toEqual({ type: 'identifier', name: 'a' });
      expect(orExpr.right).toEqual({ type: 'identifier', name: 'b' });

      expect(coalesceExpr.right).toEqual({ type: 'identifier', name: 'c' });
    });

    it('should parse complex expression with ?? and arithmetic', () => {
      const statements = parseSource('result = count ?? 0 + 1');
      expect(statements).toHaveLength(1);

      const assignment = statements[0] as Assignment;
      const coalesceExpr = assignment.value as BinaryExpression;
      expect(coalesceExpr.type).toBe('binary');
      expect(coalesceExpr.operator).toBe('??');
      expect(coalesceExpr.left).toEqual({ type: 'identifier', name: 'count' });

      // Right side should be (0 + 1)
      const addExpr = coalesceExpr.right as BinaryExpression;
      expect(addExpr.type).toBe('binary');
      expect(addExpr.operator).toBe('+');
      expect(addExpr.left).toEqual({ type: 'number', value: 0 });
      expect(addExpr.right).toEqual({ type: 'number', value: 1 });
    });
  });

  describe('Parentheses with ??', () => {
    it('should handle explicit parentheses with ??', () => {
      const statements = parseSource('result = (a ?? b) || c');
      expect(statements).toHaveLength(1);

      const assignment = statements[0] as Assignment;
      const orExpr = assignment.value as BinaryExpression;
      expect(orExpr.type).toBe('binary');
      expect(orExpr.operator).toBe('||');

      // Left side should be (a ?? b)
      const coalesceExpr = orExpr.left as BinaryExpression;
      expect(coalesceExpr.type).toBe('binary');
      expect(coalesceExpr.operator).toBe('??');
      expect(coalesceExpr.left).toEqual({ type: 'identifier', name: 'a' });
      expect(coalesceExpr.right).toEqual({ type: 'identifier', name: 'b' });

      expect(orExpr.right).toEqual({ type: 'identifier', name: 'c' });
    });

    it('should handle parentheses changing precedence', () => {
      const statements = parseSource('result = a ?? (b + c)');
      expect(statements).toHaveLength(1);

      const assignment = statements[0] as Assignment;
      const coalesceExpr = assignment.value as BinaryExpression;
      expect(coalesceExpr.type).toBe('binary');
      expect(coalesceExpr.operator).toBe('??');
      expect(coalesceExpr.left).toEqual({ type: 'identifier', name: 'a' });

      // Right side should be (b + c)
      const addExpr = coalesceExpr.right as BinaryExpression;
      expect(addExpr.type).toBe('binary');
      expect(addExpr.operator).toBe('+');
    });
  });

  describe('Expression statements with ??', () => {
    it('should parse ?? as expression statement', () => {
      const statements = parseSource('a ?? b');
      expect(statements).toHaveLength(1);

      const exprStmt = statements[0];
      expect(exprStmt.type).toBe('expression_statement');

      // Access the expression property
      const binary = (exprStmt as { expression: BinaryExpression })
        .expression as BinaryExpression;
      expect(binary.type).toBe('binary');
      expect(binary.operator).toBe('??');
      expect(binary.left).toEqual({ type: 'identifier', name: 'a' });
      expect(binary.right).toEqual({ type: 'identifier', name: 'b' });
    });
  });
});
