// Parser tests for expressions
import { describe, it, expect } from 'vitest';
import { parseSource } from '../../parser.js';
import {
  Assignment,
  CallExpression,
  MemberExpression,
  Identifier,
  StringLiteral,
  NumberLiteral,
  BooleanLiteral,
  BinaryExpression,
} from '../../ast.js';

describe('Parser - Expressions', () => {
  describe('Call Expressions', () => {
    it('should parse function calls with no arguments', () => {
      const statements = parseSource('result = getData()');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const call = stmt.value as CallExpression;
      expect(call.type).toBe('call');
      expect((call.callee as Identifier).name).toBe('getData');
      expect(call.arguments).toHaveLength(0);
    });

    it('should parse function calls with arguments', () => {
      const statements = parseSource('result = add(1, 2)');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const call = stmt.value as CallExpression;
      expect(call.type).toBe('call');
      expect((call.callee as Identifier).name).toBe('add');
      expect(call.arguments).toHaveLength(2);
      expect((call.arguments[0] as NumberLiteral).value).toBe(1);
      expect((call.arguments[1] as NumberLiteral).value).toBe(2);
    });

    it('should parse function calls with mixed argument types', () => {
      const statements = parseSource('result = process("text", 42, true)');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const call = stmt.value as CallExpression;
      expect(call.arguments).toHaveLength(3);
      expect((call.arguments[0] as StringLiteral).value).toBe('text');
      expect((call.arguments[1] as NumberLiteral).value).toBe(42);
      expect((call.arguments[2] as BooleanLiteral).value).toBe(true);
    });

    it('should parse nested function calls', () => {
      const statements = parseSource('result = outer(inner(42))');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const outerCall = stmt.value as CallExpression;
      expect((outerCall.callee as Identifier).name).toBe('outer');
      expect(outerCall.arguments).toHaveLength(1);
      const innerCall = outerCall.arguments[0] as CallExpression;
      expect(innerCall.type).toBe('call');
      expect((innerCall.callee as Identifier).name).toBe('inner');
      expect((innerCall.arguments[0] as NumberLiteral).value).toBe(42);
    });
  });

  describe('Member Expressions', () => {
    it('should parse member access', () => {
      const statements = parseSource('x = obj.property');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const member = stmt.value as MemberExpression;
      expect(member.type).toBe('member');
      expect((member.object as Identifier).name).toBe('obj');
      expect(member.property).toBe('property');
    });

    it('should parse member method calls', () => {
      const statements = parseSource('result = obj.method(arg)');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const call = stmt.value as CallExpression;
      expect(call.type).toBe('call');
      const member = call.callee as MemberExpression;
      expect(member.type).toBe('member');
      expect((member.object as Identifier).name).toBe('obj');
      expect(member.property).toBe('method');
      expect(call.arguments).toHaveLength(1);
    });

    it('should parse chained member expressions', () => {
      const statements = parseSource('x = a.b.c');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const outer = stmt.value as MemberExpression;
      expect(outer.property).toBe('c');
      const inner = outer.object as MemberExpression;
      expect(inner.type).toBe('member');
      expect((inner.object as Identifier).name).toBe('a');
      expect(inner.property).toBe('b');
    });
  });

  describe('Binary Expressions', () => {
    it('should parse addition expressions', () => {
      const statements = parseSource('result = a + b');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const binary = stmt.value as BinaryExpression;
      expect(binary.type).toBe('binary');
      expect(binary.operator).toBe('+');
      expect((binary.left as Identifier).name).toBe('a');
      expect((binary.right as Identifier).name).toBe('b');
    });

    it('should parse subtraction expressions', () => {
      const statements = parseSource('result = 10 - 5');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const binary = stmt.value as BinaryExpression;
      expect(binary.type).toBe('binary');
      expect(binary.operator).toBe('-');
      expect((binary.left as NumberLiteral).value).toBe(10);
      expect((binary.right as NumberLiteral).value).toBe(5);
    });

    it('should parse multiplication expressions', () => {
      const statements = parseSource('result = x * y');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const binary = stmt.value as BinaryExpression;
      expect(binary.type).toBe('binary');
      expect(binary.operator).toBe('*');
      expect((binary.left as Identifier).name).toBe('x');
      expect((binary.right as Identifier).name).toBe('y');
    });

    it('should parse division expressions', () => {
      const statements = parseSource('result = 20 / 4');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const binary = stmt.value as BinaryExpression;
      expect(binary.type).toBe('binary');
      expect(binary.operator).toBe('/');
      expect((binary.left as NumberLiteral).value).toBe(20);
      expect((binary.right as NumberLiteral).value).toBe(4);
    });

    it('should parse modulo expressions', () => {
      const statements = parseSource('result = a % b');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const binary = stmt.value as BinaryExpression;
      expect(binary.type).toBe('binary');
      expect(binary.operator).toBe('%');
      expect((binary.left as Identifier).name).toBe('a');
      expect((binary.right as Identifier).name).toBe('b');
    });

    it('should handle operator precedence (multiplication before addition)', () => {
      const statements = parseSource('result = a + b * c');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const outerBinary = stmt.value as BinaryExpression;
      expect(outerBinary.operator).toBe('+');
      expect((outerBinary.left as Identifier).name).toBe('a');

      const innerBinary = outerBinary.right as BinaryExpression;
      expect(innerBinary.type).toBe('binary');
      expect(innerBinary.operator).toBe('*');
      expect((innerBinary.left as Identifier).name).toBe('b');
      expect((innerBinary.right as Identifier).name).toBe('c');
    });

    it('should handle operator precedence (division before subtraction)', () => {
      const statements = parseSource('result = x - y / z');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const outerBinary = stmt.value as BinaryExpression;
      expect(outerBinary.operator).toBe('-');
      expect((outerBinary.left as Identifier).name).toBe('x');

      const innerBinary = outerBinary.right as BinaryExpression;
      expect(innerBinary.type).toBe('binary');
      expect(innerBinary.operator).toBe('/');
      expect((innerBinary.left as Identifier).name).toBe('y');
      expect((innerBinary.right as Identifier).name).toBe('z');
    });

    it('should handle left associativity for same precedence operators', () => {
      const statements = parseSource('result = a - b + c');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const outerBinary = stmt.value as BinaryExpression;
      expect(outerBinary.operator).toBe('+');
      expect((outerBinary.right as Identifier).name).toBe('c');

      const innerBinary = outerBinary.left as BinaryExpression;
      expect(innerBinary.type).toBe('binary');
      expect(innerBinary.operator).toBe('-');
      expect((innerBinary.left as Identifier).name).toBe('a');
      expect((innerBinary.right as Identifier).name).toBe('b');
    });

    it('should handle parentheses to override precedence', () => {
      const statements = parseSource('result = (a + b) * c');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const outerBinary = stmt.value as BinaryExpression;
      expect(outerBinary.operator).toBe('*');
      expect((outerBinary.right as Identifier).name).toBe('c');

      const innerBinary = outerBinary.left as BinaryExpression;
      expect(innerBinary.type).toBe('binary');
      expect(innerBinary.operator).toBe('+');
      expect((innerBinary.left as Identifier).name).toBe('a');
      expect((innerBinary.right as Identifier).name).toBe('b');
    });

    it('should handle complex nested expressions', () => {
      const statements = parseSource('result = (a + b) * (c - d)');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const outerBinary = stmt.value as BinaryExpression;
      expect(outerBinary.operator).toBe('*');

      const leftBinary = outerBinary.left as BinaryExpression;
      expect(leftBinary.type).toBe('binary');
      expect(leftBinary.operator).toBe('+');
      expect((leftBinary.left as Identifier).name).toBe('a');
      expect((leftBinary.right as Identifier).name).toBe('b');

      const rightBinary = outerBinary.right as BinaryExpression;
      expect(rightBinary.type).toBe('binary');
      expect(rightBinary.operator).toBe('-');
      expect((rightBinary.left as Identifier).name).toBe('c');
      expect((rightBinary.right as Identifier).name).toBe('d');
    });

    it('should handle binary expressions with literals and variables', () => {
      const statements = parseSource('result = 10 + x * 2.5');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const outerBinary = stmt.value as BinaryExpression;
      expect(outerBinary.operator).toBe('+');
      expect((outerBinary.left as NumberLiteral).value).toBe(10);

      const innerBinary = outerBinary.right as BinaryExpression;
      expect(innerBinary.operator).toBe('*');
      expect((innerBinary.left as Identifier).name).toBe('x');
      expect((innerBinary.right as NumberLiteral).value).toBe(2.5);
    });

    it('should handle binary expressions in function calls', () => {
      const statements = parseSource('result = calculate(a + b, x * y)');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const call = stmt.value as CallExpression;
      expect(call.type).toBe('call');
      expect(call.arguments).toHaveLength(2);

      const firstArg = call.arguments[0] as BinaryExpression;
      expect(firstArg.type).toBe('binary');
      expect(firstArg.operator).toBe('+');

      const secondArg = call.arguments[1] as BinaryExpression;
      expect(secondArg.type).toBe('binary');
      expect(secondArg.operator).toBe('*');
    });

    // Comparison operators tests
    it('should parse equality comparison expressions', () => {
      const statements = parseSource('result = a == b');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const binary = stmt.value as BinaryExpression;
      expect(binary.type).toBe('binary');
      expect(binary.operator).toBe('==');
      expect((binary.left as Identifier).name).toBe('a');
      expect((binary.right as Identifier).name).toBe('b');
    });

    it('should parse inequality comparison expressions', () => {
      const statements = parseSource('result = x != y');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const binary = stmt.value as BinaryExpression;
      expect(binary.type).toBe('binary');
      expect(binary.operator).toBe('!=');
      expect((binary.left as Identifier).name).toBe('x');
      expect((binary.right as Identifier).name).toBe('y');
    });

    it('should parse less than comparison expressions', () => {
      const statements = parseSource('result = 5 < 10');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const binary = stmt.value as BinaryExpression;
      expect(binary.type).toBe('binary');
      expect(binary.operator).toBe('<');
      expect((binary.left as NumberLiteral).value).toBe(5);
      expect((binary.right as NumberLiteral).value).toBe(10);
    });

    it('should parse greater than comparison expressions', () => {
      const statements = parseSource('result = m > n');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const binary = stmt.value as BinaryExpression;
      expect(binary.type).toBe('binary');
      expect(binary.operator).toBe('>');
      expect((binary.left as Identifier).name).toBe('m');
      expect((binary.right as Identifier).name).toBe('n');
    });

    it('should parse less than or equal comparison expressions', () => {
      const statements = parseSource('result = age <= 18');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const binary = stmt.value as BinaryExpression;
      expect(binary.type).toBe('binary');
      expect(binary.operator).toBe('<=');
      expect((binary.left as Identifier).name).toBe('age');
      expect((binary.right as NumberLiteral).value).toBe(18);
    });

    it('should parse greater than or equal comparison expressions', () => {
      const statements = parseSource('result = score >= 90');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const binary = stmt.value as BinaryExpression;
      expect(binary.type).toBe('binary');
      expect(binary.operator).toBe('>=');
      expect((binary.left as Identifier).name).toBe('score');
      expect((binary.right as NumberLiteral).value).toBe(90);
    });

    it('should handle comparison operator precedence (comparisons before arithmetic)', () => {
      const statements = parseSource('result = a + b == c * d');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const outerBinary = stmt.value as BinaryExpression;
      expect(outerBinary.operator).toBe('==');

      const leftBinary = outerBinary.left as BinaryExpression;
      expect(leftBinary.type).toBe('binary');
      expect(leftBinary.operator).toBe('+');
      expect((leftBinary.left as Identifier).name).toBe('a');
      expect((leftBinary.right as Identifier).name).toBe('b');

      const rightBinary = outerBinary.right as BinaryExpression;
      expect(rightBinary.type).toBe('binary');
      expect(rightBinary.operator).toBe('*');
      expect((rightBinary.left as Identifier).name).toBe('c');
      expect((rightBinary.right as Identifier).name).toBe('d');
    });

    it('should handle chained comparisons with left associativity', () => {
      const statements = parseSource('result = a < b == c > d');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const outerBinary = stmt.value as BinaryExpression;
      expect(outerBinary.operator).toBe('>');
      expect((outerBinary.right as Identifier).name).toBe('d');

      const middleBinary = outerBinary.left as BinaryExpression;
      expect(middleBinary.type).toBe('binary');
      expect(middleBinary.operator).toBe('==');
      expect((middleBinary.right as Identifier).name).toBe('c');

      const innerBinary = middleBinary.left as BinaryExpression;
      expect(innerBinary.type).toBe('binary');
      expect(innerBinary.operator).toBe('<');
      expect((innerBinary.left as Identifier).name).toBe('a');
      expect((innerBinary.right as Identifier).name).toBe('b');
    });

    it('should handle comparisons with different data types', () => {
      const statements = parseSource(
        'result1 = name == "John"\nresult2 = count > 0\nresult3 = flag != true'
      );
      expect(statements).toHaveLength(3);

      const stmt1 = statements[0] as Assignment;
      const binary1 = stmt1.value as BinaryExpression;
      expect(binary1.operator).toBe('==');
      expect((binary1.left as Identifier).name).toBe('name');
      expect((binary1.right as StringLiteral).value).toBe('John');

      const stmt2 = statements[1] as Assignment;
      const binary2 = stmt2.value as BinaryExpression;
      expect(binary2.operator).toBe('>');
      expect((binary2.left as Identifier).name).toBe('count');
      expect((binary2.right as NumberLiteral).value).toBe(0);

      const stmt3 = statements[2] as Assignment;
      const binary3 = stmt3.value as BinaryExpression;
      expect(binary3.operator).toBe('!=');
      expect((binary3.left as Identifier).name).toBe('flag');
      expect((binary3.right as BooleanLiteral).value).toBe(true);
    });

    it('should handle comparisons in parentheses', () => {
      const statements = parseSource('result = (a == b) != (c < d)');
      expect(statements).toHaveLength(1);
      const stmt = statements[0] as Assignment;
      const outerBinary = stmt.value as BinaryExpression;
      expect(outerBinary.operator).toBe('!=');

      const leftBinary = outerBinary.left as BinaryExpression;
      expect(leftBinary.operator).toBe('==');
      expect((leftBinary.left as Identifier).name).toBe('a');
      expect((leftBinary.right as Identifier).name).toBe('b');

      const rightBinary = outerBinary.right as BinaryExpression;
      expect(rightBinary.operator).toBe('<');
      expect((rightBinary.left as Identifier).name).toBe('c');
      expect((rightBinary.right as Identifier).name).toBe('d');
    });
  });
});
