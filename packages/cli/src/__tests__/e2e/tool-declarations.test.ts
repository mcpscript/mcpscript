import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type MockInstance,
} from 'vitest';
import { parseSource, generateCode } from '@mcps/transpiler';
import { executeInVM } from '@mcps/runtime';

describe('E2E - Tool Declarations', () => {
  let consoleLogSpy: MockInstance;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should execute a simple tool', async () => {
    const source = `
      tool getValue() {
        return 42
      }

      result = getValue()
      print(result)
    `;

    const ast = parseSource(source);
    const code = generateCode(ast);

    await executeInVM(code, { timeout: 5000 });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(42);
  });

  it('should execute a tool with parameters', async () => {
    const source = `
      tool double(x) {
        return x * 2
      }

      result = double(21)
      print(result)
    `;

    const ast = parseSource(source);
    const code = generateCode(ast);

    await executeInVM(code, { timeout: 5000 });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(42);
  });

  it('should execute a tool with multiple parameters', async () => {
    const source = `
      tool add(a, b, c) {
        return a + b + c
      }

      result = add(10, 20, 30)
      print(result)
    `;

    const ast = parseSource(source);
    const code = generateCode(ast);

    await executeInVM(code, { timeout: 5000 });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(60);
  });

  it('should execute a tool calling another tool', async () => {
    const source = `
      tool square(x) {
        return x * x
      }

      tool sumOfSquares(a, b) {
        aSquared = square(a)
        bSquared = square(b)
        return aSquared + bSquared
      }

      result = sumOfSquares(3, 4)
      print(result)
    `;

    const ast = parseSource(source);
    const code = generateCode(ast);

    await executeInVM(code, { timeout: 5000 });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(25); // 3^2 + 4^2 = 9 + 16 = 25
  });

  it('should execute a tool with conditional logic', async () => {
    const source = `
      tool isPositive(x) {
        if (x > 0) {
          return true
        } else {
          return false
        }
      }

      print(isPositive(5))
      print(isPositive(-3))
      print(isPositive(0))
    `;

    const ast = parseSource(source);
    const code = generateCode(ast);

    await executeInVM(code, { timeout: 5000 });

    expect(consoleLogSpy).toHaveBeenCalledTimes(3);
    expect(consoleLogSpy).toHaveBeenNthCalledWith(1, true);
    expect(consoleLogSpy).toHaveBeenNthCalledWith(2, false);
    expect(consoleLogSpy).toHaveBeenNthCalledWith(3, false);
  });

  it('should execute a tool with loops', async () => {
    const source = `
      tool factorial(n) {
        result = 1
        for (i = 1; i <= n; i = i + 1) {
          result = result * i
        }
        return result
      }

      print(factorial(5))
    `;

    const ast = parseSource(source);
    const code = generateCode(ast);

    await executeInVM(code, { timeout: 5000 });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(120); // 5! = 120
  });

  it('should handle early return', async () => {
    const source = `
      tool findFirst(items, target) {
        for (i = 0; i < items.length; i = i + 1) {
          if (items[i] == target) {
            return i
          }
        }
        return -1
      }

      arr = [10, 20, 30, 40, 50]
      print(findFirst(arr, 30))
      print(findFirst(arr, 99))
    `;

    const ast = parseSource(source);
    const code = generateCode(ast);

    await executeInVM(code, { timeout: 5000 });

    expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 2);
    expect(consoleLogSpy).toHaveBeenNthCalledWith(2, -1);
  });

  it('should handle return without value', async () => {
    const source = `
      tool logAndReturn(x) {
        print(x)
        return
      }

      result = logAndReturn(42)
      print(result)
    `;

    const ast = parseSource(source);
    const code = generateCode(ast);

    await executeInVM(code, { timeout: 5000 });

    expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 42);
    expect(consoleLogSpy).toHaveBeenNthCalledWith(2, undefined);
  });

  it('should handle tools with array operations', async () => {
    const source = `
      tool sumArray(items) {
        total = 0
        for (i = 0; i < items.length; i = i + 1) {
          total = total + items[i]
        }
        return total
      }

      numbers = [1, 2, 3, 4, 5]
      print(sumArray(numbers))
    `;

    const ast = parseSource(source);
    const code = generateCode(ast);

    await executeInVM(code, { timeout: 5000 });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(15);
  });

  it('should handle tools with object operations', async () => {
    const source = `
      tool getProperty(obj, key) {
        return obj[key]
      }

      data = { name: "Alice", age: 30 }
      print(getProperty(data, "name"))
      print(getProperty(data, "age"))
    `;

    const ast = parseSource(source);
    const code = generateCode(ast);

    await executeInVM(code, { timeout: 5000 });

    expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 'Alice');
    expect(consoleLogSpy).toHaveBeenNthCalledWith(2, 30);
  });

  it('should handle recursive tools', async () => {
    const source = `
      tool fibonacci(n) {
        if (n <= 1) {
          return n
        }
        return fibonacci(n - 1) + fibonacci(n - 2)
      }

      print(fibonacci(0))
      print(fibonacci(1))
      print(fibonacci(5))
      print(fibonacci(7))
    `;

    const ast = parseSource(source);
    const code = generateCode(ast);

    await executeInVM(code, { timeout: 5000 });

    expect(consoleLogSpy).toHaveBeenCalledTimes(4);
    expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 0);
    expect(consoleLogSpy).toHaveBeenNthCalledWith(2, 1);
    expect(consoleLogSpy).toHaveBeenNthCalledWith(3, 5);
    expect(consoleLogSpy).toHaveBeenNthCalledWith(4, 13);
  });

  it('should handle tools with complex expressions', async () => {
    const source = `
      tool calculate(a, b, c) {
        x = a * b
        y = x + c
        z = y / 2
        return z
      }

      print(calculate(10, 5, 20))
    `;

    const ast = parseSource(source);
    const code = generateCode(ast);

    await executeInVM(code, { timeout: 5000 });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(35); // (10 * 5 + 20) / 2 = 70 / 2 = 35
  });
});
