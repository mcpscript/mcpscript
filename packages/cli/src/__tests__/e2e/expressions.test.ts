// E2E integration tests for expression evaluation
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type MockInstance,
} from 'vitest';
import { parseSource, generateCode } from '@mcpscript/transpiler';
import { executeInVM } from '@mcpscript/runtime';

describe('Expression Evaluation E2E Integration', () => {
  let consoleLogSpy: MockInstance;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('Arithmetic Expressions', () => {
    it('should handle basic arithmetic operations at runtime', async () => {
      const source = `
addition = 5 + 3
subtraction = 10 - 4
multiplication = 6 * 7
division = 15 / 3
modulo = 17 % 5
print(addition)
print(subtraction)
print(multiplication)
print(division)
print(modulo)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(5);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 8);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, 6);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(3, 42);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(4, 5);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(5, 2);
    });

    it('should handle decimal arithmetic at runtime', async () => {
      const source = `
decimal_add = 2.5 + 1.75
decimal_sub = 10.8 - 3.2
decimal_mult = 3.14 * 2
decimal_div = 9.6 / 3.2
print(decimal_add)
print(decimal_sub)
print(decimal_mult)
print(decimal_div)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(4);
      expect(consoleLogSpy.mock.calls[0][0]).toBeCloseTo(4.25);
      expect(consoleLogSpy.mock.calls[1][0]).toBeCloseTo(7.6);
      expect(consoleLogSpy.mock.calls[2][0]).toBeCloseTo(6.28);
      expect(consoleLogSpy.mock.calls[3][0]).toBeCloseTo(3);
    });

    it('should handle operator precedence correctly at runtime', async () => {
      const source = `
precedence1 = 2 + 3 * 4
precedence2 = 10 - 6 / 2
precedence3 = 5 * 3 + 2
precedence4 = 20 / 4 - 1
print(precedence1)
print(precedence2)
print(precedence3)
print(precedence4)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(4);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 14); // 2 + (3 * 4) = 2 + 12 = 14
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, 7); // 10 - (6 / 2) = 10 - 3 = 7
      expect(consoleLogSpy).toHaveBeenNthCalledWith(3, 17); // (5 * 3) + 2 = 15 + 2 = 17
      expect(consoleLogSpy).toHaveBeenNthCalledWith(4, 4); // (20 / 4) - 1 = 5 - 1 = 4
    });

    it('should handle parentheses to override precedence at runtime', async () => {
      const source = `
override1 = (2 + 3) * 4
override2 = (10 - 6) / 2
override3 = 5 * (3 + 2)
override4 = 20 / (4 - 1)
print(override1)
print(override2)
print(override3)
print(override4)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(4);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 20); // (2 + 3) * 4 = 5 * 4 = 20
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, 2); // (10 - 6) / 2 = 4 / 2 = 2
      expect(consoleLogSpy).toHaveBeenNthCalledWith(3, 25); // 5 * (3 + 2) = 5 * 5 = 25
      expect(consoleLogSpy).toHaveBeenNthCalledWith(4, 6.666666666666667); // 20 / (4 - 1) = 20 / 3
    });
  });

  describe('Comparison Expressions', () => {
    it('should handle equality comparisons at runtime', async () => {
      const source = `
eq1 = 5 == 5
eq2 = 5 == 3
neq1 = 5 != 3
neq2 = 5 != 5
print(eq1)
print(eq2)
print(neq1)
print(neq2)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(4);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, true);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, false);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(3, true);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(4, false);
    });

    it('should handle relational comparisons at runtime', async () => {
      const source = `
lt1 = 3 < 5
lt2 = 5 < 3
gt1 = 5 > 3
gt2 = 3 > 5
lte1 = 3 <= 5
lte2 = 5 <= 5
lte3 = 5 <= 3
gte1 = 5 >= 3
gte2 = 5 >= 5
gte3 = 3 >= 5
print(lt1, lt2, gt1, gt2)
print(lte1, lte2, lte3)
print(gte1, gte2, gte3)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(3);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(
        1,
        true,
        false,
        true,
        false
      );
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, true, true, false);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(3, true, true, false);
    });

    it('should handle string comparisons at runtime', async () => {
      const source = `
str_eq1 = "hello" == "hello"
str_eq2 = "hello" == "world"
str_neq = "hello" != "world"
str_lt = "apple" < "banana"
str_gt = "zebra" > "apple"
print(str_eq1)
print(str_eq2)
print(str_neq)
print(str_lt)
print(str_gt)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(5);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, true);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, false);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(3, true);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(4, true);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(5, true);
    });
  });

  describe('Logical Expressions', () => {
    it('should handle logical AND operations at runtime', async () => {
      const source = `
and1 = true && true
and2 = true && false
and3 = false && true
and4 = false && false
print(and1)
print(and2)
print(and3)
print(and4)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(4);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, true);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, false);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(3, false);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(4, false);
    });

    it('should handle logical OR operations at runtime', async () => {
      const source = `
or1 = true || true
or2 = true || false
or3 = false || true
or4 = false || false
print(or1)
print(or2)
print(or3)
print(or4)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(4);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, true);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, true);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(3, true);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(4, false);
    });

    it('should handle logical operator precedence at runtime', async () => {
      const source = `
precedence1 = true || false && false
precedence2 = false && true || true
precedence3 = true && false || true
print(precedence1)
print(precedence2)
print(precedence3)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(3);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, true); // true || (false && false) = true || false = true
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, true); // (false && true) || true = false || true = true
      expect(consoleLogSpy).toHaveBeenNthCalledWith(3, true); // (true && false) || true = false || true = true
    });

    it('should handle mixed logical and comparison expressions at runtime', async () => {
      const source = `
mixed1 = 5 > 3 && 2 < 4
mixed2 = 5 < 3 || 2 > 1
mixed3 = 5 == 5 && 3 != 4
mixed4 = 1 > 2 || 3 <= 3
print(mixed1)
print(mixed2)
print(mixed3)
print(mixed4)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(4);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, true); // true && true = true
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, true); // false || true = true
      expect(consoleLogSpy).toHaveBeenNthCalledWith(3, true); // true && true = true
      expect(consoleLogSpy).toHaveBeenNthCalledWith(4, true); // false || true = true
    });
  });

  describe('Unary Expressions', () => {
    it('should handle logical NOT operations at runtime', async () => {
      const source = `
not1 = !true
not2 = !false
not3 = !(5 > 3)
not4 = !(5 < 3)
print(not1)
print(not2)
print(not3)
print(not4)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(4);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, false);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, true);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(3, false);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(4, true);
    });

    it('should handle unary minus operations at runtime', async () => {
      const source = `
neg1 = -5
neg2 = -(3)
neg3 = -(2 + 3)
neg4 = -3.14
print(neg1)
print(neg2)
print(neg3)
print(neg4)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(4);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, -5);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, -3);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(3, -5);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(4, -3.14);
    });

    it('should handle multiple unary operators at runtime', async () => {
      const source = `
double_not = !!true
not_neg = !(-0)
neg_not = (-(!(false)))
nested_neg = -(3 + 2)
print(double_not)
print(not_neg)
print(neg_not)
print(nested_neg)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(4);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, true); // !!true = true
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, true); // !(-0) = !0 = true
      expect(consoleLogSpy).toHaveBeenNthCalledWith(3, -1); // (-(!(false))) = (-(!false)) = (-(true)) = -1
      expect(consoleLogSpy).toHaveBeenNthCalledWith(4, -5); // -(3 + 2) = -5
    });
  });

  describe('Complex Expressions', () => {
    it('should handle nested expressions with mixed operators at runtime', async () => {
      const source = `
complex1 = (5 + 3) * 2 > 10 && true
complex2 = !(3 > 5) || (2 + 2) == 4
complex3 = 10 / (2 + 3) != 2 && 5 % 3 == 2
complex4 = (true || false) && (3 < 5) && !(1 > 2)
print(complex1)
print(complex2)
print(complex3)
print(complex4)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(4);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, true); // (8 * 2 > 10) && true = (16 > 10) && true = true && true = true
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, true); // !false || true = true || true = true
      expect(consoleLogSpy).toHaveBeenNthCalledWith(3, false); // (2 != 2) && (2 == 2) = false && true = false
      expect(consoleLogSpy).toHaveBeenNthCalledWith(4, true); // true && true && true = true
    });

    it('should handle expressions with variable references at runtime', async () => {
      const source = `
x = 5
y = 3
z = true
result1 = x + y > 7
result2 = z && x > y
result3 = !z || x == y
result4 = (x * y) - 10 == y + 2
print(result1)
print(result2)
print(result3)
print(result4)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(4);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, true); // 8 > 7 = true
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, true); // true && true = true
      expect(consoleLogSpy).toHaveBeenNthCalledWith(3, false); // false || false = false
      expect(consoleLogSpy).toHaveBeenNthCalledWith(4, true); // (15 - 10) == 5 = 5 == 5 = true
    });

    it('should handle expression evaluation in function calls at runtime', async () => {
      const source = `
print(5 + 3)
print(10 > 5)
print(true && false)
print(!(2 == 3))
print((4 * 5) / 2)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(5);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 8);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, true);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(3, false);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(4, true);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(5, 10);
    });
  });
});
