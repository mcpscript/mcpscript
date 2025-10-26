import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type MockInstance,
} from 'vitest';
import { print } from '../globals.js';

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
      const testValue = 'Hello, World!';
      print(testValue);

      expect(consoleLogSpy).toHaveBeenCalledOnce();
      expect(consoleLogSpy).toHaveBeenCalledWith(testValue);
    });

    it('should handle string values', () => {
      const stringValue = 'test string';
      print(stringValue);

      expect(consoleLogSpy).toHaveBeenCalledWith(stringValue);
    });

    it('should handle number values', () => {
      const numberValue = 42;
      print(numberValue);

      expect(consoleLogSpy).toHaveBeenCalledWith(numberValue);
    });

    it('should handle boolean values', () => {
      const booleanValue = true;
      print(booleanValue);

      expect(consoleLogSpy).toHaveBeenCalledWith(booleanValue);
    });

    it('should handle null values', () => {
      print(null);

      expect(consoleLogSpy).toHaveBeenCalledWith(null);
    });

    it('should handle undefined values', () => {
      print(undefined);

      expect(consoleLogSpy).toHaveBeenCalledWith(undefined);
    });

    it('should handle object values', () => {
      const objectValue = { key: 'value', number: 123 };
      print(objectValue);

      expect(consoleLogSpy).toHaveBeenCalledWith(objectValue);
    });

    it('should handle array values', () => {
      const arrayValue = [1, 2, 3, 'test'];
      print(arrayValue);

      expect(consoleLogSpy).toHaveBeenCalledWith(arrayValue);
    });

    it('should handle function values', () => {
      const functionValue = () => 'test';
      print(functionValue);

      expect(consoleLogSpy).toHaveBeenCalledWith(functionValue);
    });

    it('should handle multiple calls independently', () => {
      print('first');
      print('second');
      print(123);

      expect(consoleLogSpy).toHaveBeenCalledTimes(3);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 'first');
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, 'second');
      expect(consoleLogSpy).toHaveBeenNthCalledWith(3, 123);
    });

    it('should return void', () => {
      const result = print('test');

      expect(result).toBeUndefined();
    });

    it('should handle multiple arguments', () => {
      print('Hello', 'World', 123);

      expect(consoleLogSpy).toHaveBeenCalledOnce();
      expect(consoleLogSpy).toHaveBeenCalledWith('Hello', 'World', 123);
    });

    it('should handle mixed types as multiple arguments', () => {
      const obj = { key: 'value' };
      const arr = [1, 2, 3];
      print('string', 42, true, null, undefined, obj, arr);

      expect(consoleLogSpy).toHaveBeenCalledWith('string', 42, true, null, undefined, obj, arr);
    });

    it('should handle no arguments', () => {
      print();

      expect(consoleLogSpy).toHaveBeenCalledOnce();
      expect(consoleLogSpy).toHaveBeenCalledWith();
    });

    it('should handle multiple arguments in separate calls', () => {
      print('first', 'call');
      print('second', 'call', 123);
      print('third');

      expect(consoleLogSpy).toHaveBeenCalledTimes(3);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 'first', 'call');
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, 'second', 'call', 123);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(3, 'third');
    });

    it('should handle many arguments', () => {
      print(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

      expect(consoleLogSpy).toHaveBeenCalledWith(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
    });
  });
});
