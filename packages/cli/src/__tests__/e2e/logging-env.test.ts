// E2E integration tests for logging and environment variables
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

describe('E2E: Logging and Environment', () => {
  let consoleDebugSpy: MockInstance;
  let consoleInfoSpy: MockInstance;
  let consoleWarnSpy: MockInstance;
  let consoleErrorSpy: MockInstance;

  beforeEach(() => {
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleDebugSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Structured Logging', () => {
    it('should log debug messages', async () => {
      const source = `log.debug("Debug message")`;
      const ast = parseSource(source);
      const code = generateCode(ast);
      await executeInVM(code);

      expect(consoleDebugSpy).toHaveBeenCalledWith('[DEBUG]', 'Debug message');
    });

    it('should log info messages', async () => {
      const source = `log.info("Info message")`;
      const ast = parseSource(source);
      const code = generateCode(ast);
      await executeInVM(code);

      expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO]', 'Info message');
    });

    it('should log warning messages', async () => {
      const source = `log.warn("Warning message")`;
      const ast = parseSource(source);
      const code = generateCode(ast);
      await executeInVM(code);

      expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN]', 'Warning message');
    });

    it('should log error messages', async () => {
      const source = `log.error("Error message")`;
      const ast = parseSource(source);
      const code = generateCode(ast);
      await executeInVM(code);

      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR]', 'Error message');
    });

    it('should log with multiple arguments', async () => {
      const source = `log.info("User:", "Alice", 123)`;
      const ast = parseSource(source);
      const code = generateCode(ast);
      await executeInVM(code);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[INFO]',
        'User:',
        'Alice',
        123
      );
    });
  });

  describe('Environment Variables', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should access environment variables', async () => {
      process.env.TEST_VAR = 'test_value';

      const source = `x = env.TEST_VAR`;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const result = await executeInVM(code);

      expect(result.x).toBe('test_value');
    });

    it('should return undefined for non-existent variables', async () => {
      const source = `x = env.NON_EXISTENT_VAR`;
      const ast = parseSource(source);
      const code = generateCode(ast);
      const result = await executeInVM(code);

      expect(result.x).toBeUndefined();
    });
  });
});
