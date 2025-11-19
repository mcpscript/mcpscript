import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type MockInstance,
} from 'vitest';
import { createPrint, log, env } from '../globals.js';

describe('globals', () => {
  describe('print function', () => {
    let consoleLogSpy: MockInstance;

    beforeEach(() => {
      // Spy on console.log to capture its calls
      consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      // Restore console.log after each test
      consoleLogSpy.mockRestore();
    });

    it('should call console.log with the provided value', () => {
      const print = createPrint();
      const testValue = 'Hello, World!';
      print(testValue);

      expect(consoleLogSpy).toHaveBeenCalledOnce();
      expect(consoleLogSpy).toHaveBeenCalledWith(testValue);
    });

    it('should handle string values', () => {
      const print = createPrint();
      const stringValue = 'test string';
      print(stringValue);

      expect(consoleLogSpy).toHaveBeenCalledWith(stringValue);
    });

    it('should handle number values', () => {
      const print = createPrint();
      const numberValue = 42;
      print(numberValue);

      expect(consoleLogSpy).toHaveBeenCalledWith(numberValue);
    });

    it('should handle boolean values', () => {
      const print = createPrint();
      const booleanValue = true;
      print(booleanValue);

      expect(consoleLogSpy).toHaveBeenCalledWith(booleanValue);
    });

    it('should handle null values', () => {
      const print = createPrint();
      print(null);

      expect(consoleLogSpy).toHaveBeenCalledWith(null);
    });

    it('should handle undefined values', () => {
      const print = createPrint();
      print(undefined);

      expect(consoleLogSpy).toHaveBeenCalledWith(undefined);
    });

    it('should handle object values', () => {
      const print = createPrint();
      const objectValue = { key: 'value', number: 123 };
      print(objectValue);

      expect(consoleLogSpy).toHaveBeenCalledWith(objectValue);
    });

    it('should handle array values', () => {
      const print = createPrint();
      const arrayValue = [1, 2, 3, 'test'];
      print(arrayValue);

      expect(consoleLogSpy).toHaveBeenCalledWith(arrayValue);
    });

    it('should handle function values', () => {
      const print = createPrint();
      const functionValue = () => 'test';
      print(functionValue);

      expect(consoleLogSpy).toHaveBeenCalledWith(functionValue);
    });

    it('should handle multiple calls independently', () => {
      const print = createPrint();
      print('first');
      print('second');
      print(123);

      expect(consoleLogSpy).toHaveBeenCalledTimes(3);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 'first');
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, 'second');
      expect(consoleLogSpy).toHaveBeenNthCalledWith(3, 123);
    });

    it('should return void', () => {
      const print = createPrint();
      const result = print('test');

      expect(result).toBeUndefined();
    });

    it('should handle multiple arguments', () => {
      const print = createPrint();
      print('Hello', 'World', 123);

      expect(consoleLogSpy).toHaveBeenCalledOnce();
      expect(consoleLogSpy).toHaveBeenCalledWith('Hello', 'World', 123);
    });

    it('should handle mixed types as multiple arguments', () => {
      const print = createPrint();
      const obj = { key: 'value' };
      const arr = [1, 2, 3];
      print('string', 42, true, null, undefined, obj, arr);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'string',
        42,
        true,
        null,
        undefined,
        obj,
        arr
      );
    });

    it('should handle no arguments', () => {
      const print = createPrint();
      print();

      expect(consoleLogSpy).toHaveBeenCalledOnce();
      expect(consoleLogSpy).toHaveBeenCalledWith();
    });

    it('should handle multiple arguments in separate calls', () => {
      const print = createPrint();
      print('first', 'call');
      print('second', 'call', 123);
      print('third');

      expect(consoleLogSpy).toHaveBeenCalledTimes(3);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 'first', 'call');
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, 'second', 'call', 123);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(3, 'third');
    });

    it('should handle many arguments', () => {
      const print = createPrint();
      print(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

      expect(consoleLogSpy).toHaveBeenCalledWith(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
    });
  });

  describe('log object', () => {
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

    describe('log.debug', () => {
      it('should call console.debug with [DEBUG] prefix', () => {
        log.debug('Debug message');

        expect(consoleDebugSpy).toHaveBeenCalledOnce();
        expect(consoleDebugSpy).toHaveBeenCalledWith(
          '[DEBUG]',
          'Debug message'
        );
      });

      it('should handle multiple arguments', () => {
        log.debug('User action:', { id: 123, name: 'test' });

        expect(consoleDebugSpy).toHaveBeenCalledWith(
          '[DEBUG]',
          'User action:',
          { id: 123, name: 'test' }
        );
      });

      it('should handle no message', () => {
        log.debug();

        expect(consoleDebugSpy).toHaveBeenCalledWith('[DEBUG]');
      });

      it('should handle different data types', () => {
        log.debug('Mixed:', 42, true, null, undefined);

        expect(consoleDebugSpy).toHaveBeenCalledWith(
          '[DEBUG]',
          'Mixed:',
          42,
          true,
          null,
          undefined
        );
      });
    });

    describe('log.info', () => {
      it('should call console.info with [INFO] prefix', () => {
        log.info('Info message');

        expect(consoleInfoSpy).toHaveBeenCalledOnce();
        expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO]', 'Info message');
      });

      it('should handle multiple arguments', () => {
        log.info('Processing:', 'data.json', { size: 1024 });

        expect(consoleInfoSpy).toHaveBeenCalledWith(
          '[INFO]',
          'Processing:',
          'data.json',
          { size: 1024 }
        );
      });

      it('should handle arrays and objects', () => {
        const data = { items: [1, 2, 3], status: 'ok' };
        log.info('Result:', data);

        expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO]', 'Result:', data);
      });

      it('should return void', () => {
        const result = log.info('test');

        expect(result).toBeUndefined();
      });
    });

    describe('log.warn', () => {
      it('should call console.warn with [WARN] prefix', () => {
        log.warn('Warning message');

        expect(consoleWarnSpy).toHaveBeenCalledOnce();
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[WARN]',
          'Warning message'
        );
      });

      it('should handle multiple arguments', () => {
        log.warn('Deprecated:', 'oldFunction', 'use newFunction instead');

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[WARN]',
          'Deprecated:',
          'oldFunction',
          'use newFunction instead'
        );
      });

      it('should handle warning conditions', () => {
        log.warn('Rate limit approaching:', { remaining: 10, limit: 100 });

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[WARN]',
          'Rate limit approaching:',
          { remaining: 10, limit: 100 }
        );
      });
    });

    describe('log.error', () => {
      it('should call console.error with [ERROR] prefix', () => {
        log.error('Error message');

        expect(consoleErrorSpy).toHaveBeenCalledOnce();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[ERROR]',
          'Error message'
        );
      });

      it('should handle multiple arguments', () => {
        log.error('Failed to connect:', { host: 'localhost', port: 3000 });

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[ERROR]',
          'Failed to connect:',
          { host: 'localhost', port: 3000 }
        );
      });

      it('should handle error objects', () => {
        const error = new Error('Test error');
        log.error('Exception caught:', error);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[ERROR]',
          'Exception caught:',
          error
        );
      });

      it('should handle stack traces', () => {
        const error = new Error('Failed operation');
        error.stack = 'Error: Failed operation\n  at test.js:10:5';
        log.error('Error with stack:', error);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[ERROR]',
          'Error with stack:',
          error
        );
      });
    });

    describe('multiple log levels', () => {
      it('should handle mixed log levels', () => {
        log.debug('Debug info');
        log.info('Starting process');
        log.warn('Warning condition');
        log.error('Error occurred');

        expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
        expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      });

      it('should maintain separate counts per level', () => {
        log.info('First info');
        log.info('Second info');
        log.error('First error');

        expect(consoleInfoSpy).toHaveBeenCalledTimes(2);
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('env object', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      // Create a fresh copy of environment for each test
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      // Restore original environment
      process.env = originalEnv;
    });

    it('should read existing environment variables', () => {
      process.env.TEST_VAR = 'test_value';

      expect((env as Record<string, string | undefined>).TEST_VAR).toBe(
        'test_value'
      );
    });

    it('should return undefined for non-existent variables', () => {
      expect(
        (env as Record<string, string | undefined>).NON_EXISTENT_VAR
      ).toBeUndefined();
    });

    it('should handle multiple environment variables', () => {
      process.env.API_KEY = 'secret123';
      process.env.API_URL = 'https://api.example.com';
      process.env.DEBUG_MODE = 'true';

      expect((env as Record<string, string | undefined>).API_KEY).toBe(
        'secret123'
      );
      expect((env as Record<string, string | undefined>).API_URL).toBe(
        'https://api.example.com'
      );
      expect((env as Record<string, string | undefined>).DEBUG_MODE).toBe(
        'true'
      );
    });

    it('should handle numeric-looking environment variables as strings', () => {
      process.env.PORT = '3000';

      expect((env as Record<string, string | undefined>).PORT).toBe('3000');
      expect(typeof (env as Record<string, string | undefined>).PORT).toBe(
        'string'
      );
    });

    it('should handle empty string values', () => {
      process.env.EMPTY_VAR = '';

      expect((env as Record<string, string | undefined>).EMPTY_VAR).toBe('');
    });

    it('should be read-only and throw on assignment', () => {
      expect(() => {
        (env as Record<string, string>).NEW_VAR = 'value';
      }).toThrow('Environment variables are read-only');
    });

    it('should throw on modification attempt', () => {
      process.env.EXISTING_VAR = 'original';

      expect(() => {
        (env as Record<string, string>).EXISTING_VAR = 'modified';
      }).toThrow('Environment variables are read-only');
    });

    it('should handle property access with special characters', () => {
      process.env['VAR_WITH_UNDERSCORE'] = 'value1';
      process.env['VAR.WITH.DOTS'] = 'value2';

      expect(
        (env as Record<string, string | undefined>).VAR_WITH_UNDERSCORE
      ).toBe('value1');
      expect((env as Record<string, string>)['VAR.WITH.DOTS']).toBe('value2');
    });

    it('should reflect changes to process.env', () => {
      process.env.DYNAMIC_VAR = 'initial';
      expect((env as Record<string, string | undefined>).DYNAMIC_VAR).toBe(
        'initial'
      );

      process.env.DYNAMIC_VAR = 'updated';
      expect((env as Record<string, string | undefined>).DYNAMIC_VAR).toBe(
        'updated'
      );

      delete process.env.DYNAMIC_VAR;
      expect(
        (env as Record<string, string | undefined>).DYNAMIC_VAR
      ).toBeUndefined();
    });

    it('should handle common environment variables', () => {
      process.env.NODE_ENV = 'test';
      process.env.HOME = '/home/user';
      process.env.PATH = '/usr/bin:/bin';

      expect((env as Record<string, string | undefined>).NODE_ENV).toBe('test');
      expect((env as Record<string, string | undefined>).HOME).toBe(
        '/home/user'
      );
      expect((env as Record<string, string | undefined>).PATH).toBe(
        '/usr/bin:/bin'
      );
    });
  });
});
