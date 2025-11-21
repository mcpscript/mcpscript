import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { config as dotenvConfig } from 'dotenv';
import { parseSource, generateCode } from '@mcpscript/transpiler';
import { executeInVM } from '@mcpscript/runtime';
import type { MockInstance } from 'vitest';

describe('E2E: dotenv integration', () => {
  let consoleLogSpy: MockInstance;
  const testEnvFile = '.env';
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    // Restore original environment
    process.env = originalEnv;

    consoleLogSpy.mockRestore();

    // Clean up test files
    if (existsSync(testEnvFile)) {
      await unlink(testEnvFile);
    }
  });

  it('should load environment variables from .env file', async () => {
    // Create a .env file with test variables
    await writeFile(
      testEnvFile,
      'TEST_VAR_1=value_from_dotenv\nTEST_VAR_2=another_value\n'
    );

    // Load .env file
    dotenvConfig();

    // Execute script that uses environment variables
    const source = `
print(env.TEST_VAR_1)
print(env.TEST_VAR_2)
`;
    const ast = parseSource(source);
    const code = generateCode(ast);
    await executeInVM(code);

    // Verify that environment variables were loaded and printed
    expect(consoleLogSpy).toHaveBeenCalledWith('value_from_dotenv');
    expect(consoleLogSpy).toHaveBeenCalledWith('another_value');
  });

  it('should allow process.env to override .env file values', async () => {
    // Set the variable in process.env first
    process.env.OVERRIDE_VAR = 'from_process_env';

    // Create a .env file with the same variable
    await writeFile(testEnvFile, 'OVERRIDE_VAR=from_dotenv\n');

    // Load .env file (should not override existing process.env)
    dotenvConfig();

    const source = `print(env.OVERRIDE_VAR)`;
    const ast = parseSource(source);
    const code = generateCode(ast);
    await executeInVM(code);

    // Process.env should take precedence over .env file
    expect(consoleLogSpy).toHaveBeenCalledWith('from_process_env');
  });

  it('should work when .env file does not exist', async () => {
    // Ensure .env file doesn't exist
    if (existsSync(testEnvFile)) {
      await unlink(testEnvFile);
    }

    // Set environment variable directly
    process.env.NO_DOTENV_VAR = 'direct_value';

    // Load .env file (should not fail if file doesn't exist)
    dotenvConfig();

    const source = `print(env.NO_DOTENV_VAR)`;
    const ast = parseSource(source);
    const code = generateCode(ast);
    await executeInVM(code);

    // Should still work with direct environment variables
    expect(consoleLogSpy).toHaveBeenCalledWith('direct_value');
  });

  it('should handle empty values in .env file', async () => {
    await writeFile(testEnvFile, 'EMPTY_VAR=\n');

    dotenvConfig();

    const source = `val = env.EMPTY_VAR
if (val == "") {
  print("empty string")
}`;
    const ast = parseSource(source);
    const code = generateCode(ast);
    await executeInVM(code);

    expect(consoleLogSpy).toHaveBeenCalledWith('empty string');
  });

  it('should handle multiline values in .env file', async () => {
    // dotenv supports quoted multiline values
    await writeFile(testEnvFile, 'MULTILINE_VAR="line1\\nline2\\nline3"\n');

    dotenvConfig();

    const source = `print(env.MULTILINE_VAR)`;
    const ast = parseSource(source);
    const code = generateCode(ast);
    await executeInVM(code);

    expect(consoleLogSpy).toHaveBeenCalledWith('line1\nline2\nline3');
  });

  it('should handle values with spaces', async () => {
    await writeFile(testEnvFile, 'SPACED_VAR=value with spaces\n');

    dotenvConfig();

    const source = `print(env.SPACED_VAR)`;
    const ast = parseSource(source);
    const code = generateCode(ast);
    await executeInVM(code);

    expect(consoleLogSpy).toHaveBeenCalledWith('value with spaces');
  });

  it('should handle quoted values', async () => {
    await writeFile(testEnvFile, 'QUOTED_VAR="quoted value"\n');

    dotenvConfig();

    const source = `print(env.QUOTED_VAR)`;
    const ast = parseSource(source);
    const code = generateCode(ast);
    await executeInVM(code);

    expect(consoleLogSpy).toHaveBeenCalledWith('quoted value');
  });

  it('should ignore comments in .env file', async () => {
    await writeFile(
      testEnvFile,
      '# This is a comment\nVALID_VAR=valid_value\n# Another comment\n'
    );

    dotenvConfig();

    const source = `print(env.VALID_VAR)`;
    const ast = parseSource(source);
    const code = generateCode(ast);
    await executeInVM(code);

    expect(consoleLogSpy).toHaveBeenCalledWith('valid_value');
  });
});
