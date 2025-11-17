// E2E integration tests for basic types (numbers and booleans)
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

describe('Basic Types E2E Integration', () => {
  let consoleLogSpy: MockInstance;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('Number Literals', () => {
    it('should handle integer literals at runtime', async () => {
      const source = `
zero = 0
positive = 42
large = 999999
print(zero)
print(positive)
print(large)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(3);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 0);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, 42);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(3, 999999);
    });

    it('should handle decimal literals at runtime', async () => {
      const source = `
pi = 3.14159
half = 0.5
fraction = .25
smallDecimal = 0.001
print(pi)
print(half)
print(fraction)
print(smallDecimal)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(4);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 3.14159);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, 0.5);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(3, 0.25);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(4, 0.001);
    });

    it('should handle scientific notation at runtime', async () => {
      const source = `
large = 1e5
small = 2.5e-3
avogadro = 6.022e23
uppercase = 1E10
positiveExp = 1.23E+5
negativeExp = 4.56E-7
print(large)
print(small)
print(avogadro)
print(uppercase)
print(positiveExp)
print(negativeExp)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(6);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 100000);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, 0.0025);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(3, 6.022e23);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(4, 10000000000);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(5, 123000);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(6, 4.56e-7);
    });

    it('should handle numbers in arrays at runtime', async () => {
      const source = `
numbers = [0, 42, 3.14, 1e5, 2.5e-3]
print(numbers)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(
        1,
        [0, 42, 3.14, 100000, 0.0025]
      );
    });

    it('should handle numbers in objects at runtime', async () => {
      const source = `
config = { 
  port: 8080, 
  ratio: 0.75, 
  timeout: 1e4,
  retries: 3,
  precision: 1e-6
}
print(config)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, {
        port: 8080,
        ratio: 0.75,
        timeout: 10000,
        retries: 3,
        precision: 0.000001,
      });
    });

    it('should handle numbers in function calls at runtime', async () => {
      const source = `
print(42)
print(3.14159)
print(1e5)
print(0)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(4);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 42);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, 3.14159);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(3, 100000);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(4, 0);
    });
  });

  describe('Boolean Literals', () => {
    it('should handle boolean literals at runtime', async () => {
      const source = `
isEnabled = true
isDisabled = false
print(isEnabled)
print(isDisabled)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, true);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, false);
    });

    it('should handle booleans in arrays at runtime', async () => {
      const source = `
flags = [true, false, true, false]
print(flags)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, [
        true,
        false,
        true,
        false,
      ]);
    });

    it('should handle booleans in objects at runtime', async () => {
      const source = `
config = { 
  enabled: true, 
  debug: false, 
  verbose: true,
  production: false
}
print(config)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, {
        enabled: true,
        debug: false,
        verbose: true,
        production: false,
      });
    });

    it('should handle booleans in function calls at runtime', async () => {
      const source = `
print(true)
print(false)
print(true, false)
print("enabled:", true, "debug:", false)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(4);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, true);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, false);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(3, true, false);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(
        4,
        'enabled:',
        true,
        'debug:',
        false
      );
    });
  });

  describe('Mixed Number and Boolean Operations', () => {
    it('should handle mixed types in arrays at runtime', async () => {
      const source = `
mixed = [42, true, 3.14, false, 1e5, true]
print(mixed)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, [
        42,
        true,
        3.14,
        false,
        100000,
        true,
      ]);
    });

    it('should handle mixed types in objects at runtime', async () => {
      const source = `
config = { 
  name: "test",
  port: 8080, 
  enabled: true, 
  ratio: 0.75, 
  debug: false,
  timeout: 1e4,
  active: true
}
print(config)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, {
        name: 'test',
        port: 8080,
        enabled: true,
        ratio: 0.75,
        debug: false,
        timeout: 10000,
        active: true,
      });
    });

    it('should handle mixed types in function calls at runtime', async () => {
      const source = `
print("Count:", 42, "enabled:", true, "ratio:", 3.14)
print(0, false)
print(1e5, true, "test", false)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(3);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(
        1,
        'Count:',
        42,
        'enabled:',
        true,
        'ratio:',
        3.14
      );
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, 0, false);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(
        3,
        100000,
        true,
        'test',
        false
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero values', async () => {
      const source = `
zero = 0
print(zero)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 0);
    });

    it('should handle very large and very small numbers', async () => {
      const source = `
veryLarge = 9.999e307
verySmall = 1e-307
print(veryLarge)
print(verySmall)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 9.999e307);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, 1e-307);
    });

    it('should handle numbers with many decimal places', async () => {
      const source = `
precise = 3.141592653589793
moreDecimal = 0.123456789012345
print(precise)
print(moreDecimal)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 3.141592653589793);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, 0.123456789012345);
    });

    it('should handle nested data structures', async () => {
      const source = `
nested = {
  array: [1, true, 2.5, false],
  object: {
    count: 42,
    enabled: true,
    nested: {
      value: 3.14,
      active: false
    }
  }
}
print(nested)
      `.trim();

      const ast = parseSource(source);
      const code = generateCode(ast);

      await executeInVM(code, { timeout: 5000 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, {
        array: [1, true, 2.5, false],
        object: {
          count: 42,
          enabled: true,
          nested: {
            value: 3.14,
            active: false,
          },
        },
      });
    });
  });
});
