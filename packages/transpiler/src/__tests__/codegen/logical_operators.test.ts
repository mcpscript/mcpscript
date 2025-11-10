import { describe, it, expect } from 'vitest';
import { generateCode } from '../../codegen.js';
import { parseSource } from '../../parser.js';

describe('Codegen - Logical Operators', () => {
  describe('Binary logical operators', () => {
    it('should generate logical AND (&&)', () => {
      const statements = parseSource('result = a && b');
      const code = generateCode(statements);
      expect(code).toContain('let result = a && b;');
    });

    it('should generate logical OR (||)', () => {
      const statements = parseSource('result = a || b');
      const code = generateCode(statements);
      expect(code).toContain('let result = a || b;');
    });

    it('should generate logical operators with boolean literals', () => {
      const statements = parseSource('result = true && false');
      const code = generateCode(statements);
      expect(code).toContain('let result = true && false;');
    });
  });

  describe('Unary operators', () => {
    it('should generate logical NOT (!)', () => {
      const statements = parseSource('result = !condition');
      const code = generateCode(statements);
      expect(code).toContain('let result = !condition;');
    });

    it('should generate unary minus (-)', () => {
      const statements = parseSource('result = -value');
      const code = generateCode(statements);
      expect(code).toContain('let result = -value;');
    });

    it('should generate unary operators with literals', () => {
      const statements = parseSource('result = !true');
      const code = generateCode(statements);
      expect(code).toContain('let result = !true;');
    });

    it('should generate unary minus with numbers', () => {
      const statements = parseSource('result = -42');
      const code = generateCode(statements);
      expect(code).toContain('let result = -42;');
    });
  });

  describe('Operator precedence', () => {
    it('should handle AND having higher precedence than OR', () => {
      const statements = parseSource('result = a || b && c');
      const code = generateCode(statements);
      expect(code).toContain('let result = a || b && c;');
    });

    it('should handle unary operators with higher precedence', () => {
      const statements = parseSource('result = !condition || value');
      const code = generateCode(statements);
      expect(code).toContain('let result = !condition || value;');
    });

    it('should add parentheses when unary operand is binary expression', () => {
      const statements = parseSource('result = !(a == b)');
      const code = generateCode(statements);
      expect(code).toContain('let result = !(a == b);');
    });
  });

  describe('Mixed operators with proper parentheses', () => {
    it('should handle arithmetic and logical operators', () => {
      const statements = parseSource('result = x + y > 0 && z < 10');
      const code = generateCode(statements);
      expect(code).toContain('let result = x + y > 0 && z < 10;');
    });

    it('should handle complex logical expressions', () => {
      const statements = parseSource('result = !(a == b) || c != d');
      const code = generateCode(statements);
      expect(code).toContain('let result = !(a == b) || c != d;');
    });

    it('should handle nested logical operations with correct precedence', () => {
      const statements = parseSource('result = a && b || c && d');
      const code = generateCode(statements);
      expect(code).toContain('let result = a && b || c && d;');
    });
  });

  describe('Parentheses handling', () => {
    it('should preserve explicit parentheses', () => {
      const statements = parseSource('result = (a || b) && c');
      const code = generateCode(statements);
      expect(code).toContain('let result = (a || b) && c;');
    });

    it('should add parentheses for low-precedence operands', () => {
      const statements = parseSource('result = a && (b || c)');
      const code = generateCode(statements);
      expect(code).toContain('let result = a && (b || c);');
    });
  });

  describe('Expression statements', () => {
    it('should generate logical expressions as statements', () => {
      const statements = parseSource('a && b');
      const code = generateCode(statements);
      expect(code).toContain('a && b;');
    });

    it('should generate unary expressions as statements', () => {
      const statements = parseSource('!condition');
      const code = generateCode(statements);
      expect(code).toContain('!condition;');
    });
  });
});
