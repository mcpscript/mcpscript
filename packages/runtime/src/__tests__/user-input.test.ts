import { describe, it, expect, vi } from 'vitest';
import { createInput } from '../globals.js';

describe('input function (user input)', () => {
  it('should throw error when user input handler is not configured', async () => {
    const input = createInput();
    await expect(input('Enter your name:')).rejects.toThrow(
      'User input handler not configured'
    );
  });

  it('should call the configured user input handler with the message', async () => {
    const mockHandler = vi.fn().mockResolvedValue('John Doe');
    const input = createInput(mockHandler);

    const result = await input('Enter your name:');

    expect(mockHandler).toHaveBeenCalledWith('Enter your name:');
    expect(result).toBe('John Doe');
  });

  it('should return the value from user input handler', async () => {
    const mockHandler = vi.fn().mockResolvedValue('test-value');
    const input = createInput(mockHandler);

    const result = await input('Enter something:');

    expect(result).toBe('test-value');
  });

  it('should support multiple user inputs in sequence', async () => {
    const mockHandler = vi
      .fn()
      .mockResolvedValueOnce('Alice')
      .mockResolvedValueOnce('30')
      .mockResolvedValueOnce('alice@example.com');

    const input = createInput(mockHandler);

    const name = await input('Name:');
    const age = await input('Age:');
    const email = await input('Email:');

    expect(name).toBe('Alice');
    expect(age).toBe('30');
    expect(email).toBe('alice@example.com');
    expect(mockHandler).toHaveBeenCalledTimes(3);
  });

  it('should handle empty string input', async () => {
    const mockHandler = vi.fn().mockResolvedValue('');
    const input = createInput(mockHandler);

    const result = await input('Enter something:');

    expect(result).toBe('');
  });

  it('should propagate errors from user input handler', async () => {
    const mockHandler = vi.fn().mockRejectedValue(new Error('Input cancelled'));
    const input = createInput(mockHandler);

    await expect(input('Enter your name:')).rejects.toThrow('Input cancelled');
  });

  it('should create independent input functions with different handlers', async () => {
    const handler1 = vi.fn().mockResolvedValue('first');
    const input1 = createInput(handler1);

    const handler2 = vi.fn().mockResolvedValue('second');
    const input2 = createInput(handler2);

    const result1 = await input1('Test:');
    const result2 = await input2('Test:');

    expect(result1).toBe('first');
    expect(result2).toBe('second');
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('should maintain handler independence across function calls', async () => {
    const mockHandler = vi.fn().mockResolvedValue('test');
    const input = createInput(mockHandler);

    await input('Test:');
    expect(mockHandler).toHaveBeenCalled();

    const inputWithoutHandler = createInput();
    await expect(inputWithoutHandler('Test:')).rejects.toThrow(
      'User input handler not configured'
    );
  });
});
