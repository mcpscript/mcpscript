// End-to-end tests for compile command
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const TEST_DIR = join(process.cwd(), 'tmp_e2e_test_compile');
const CLI_PATH = join(process.cwd(), 'bin', 'mcps.mjs');

describe('Compile Command', () => {
  beforeAll(async () => {
    await mkdir(TEST_DIR, { recursive: true });
  });

  afterAll(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  it('should compile a simple script and output JavaScript', async () => {
    const scriptPath = join(TEST_DIR, 'simple.mcps');
    const script = `x = 42
print(x)`;

    await writeFile(scriptPath, script, 'utf-8');

    const { stdout } = await execFileAsync('node', [
      CLI_PATH,
      'compile',
      scriptPath,
    ]);

    expect(stdout).toContain('// Generated code');
    expect(stdout).toContain('let x = 42;');
    expect(stdout).toContain('print(x);');
  });

  it('should compile model declarations correctly', async () => {
    const scriptPath = join(TEST_DIR, 'model.mcps');
    const script = `model myModel {
  provider: "openai",
  model: "gpt-4o"
}`;

    await writeFile(scriptPath, script, 'utf-8');

    const { stdout } = await execFileAsync('node', [
      CLI_PATH,
      'compile',
      scriptPath,
    ]);

    expect(stdout).toContain('// Initialize model configurations');
    expect(stdout).toContain('const __models = {};');
    expect(stdout).toContain('const myModel = new __llamaindex_OpenAI');
  });

  it('should error on non-.mcps files', async () => {
    const scriptPath = join(TEST_DIR, 'invalid.txt');
    await writeFile(scriptPath, 'some content', 'utf-8');

    await expect(
      execFileAsync('node', [CLI_PATH, 'compile', scriptPath])
    ).rejects.toThrow();
  });

  it('should compile complex expressions', async () => {
    const scriptPath = join(TEST_DIR, 'expressions.mcps');
    const script = `result = (5 + 3) * 2
flag = true && false || !false`;

    await writeFile(scriptPath, script, 'utf-8');

    const { stdout } = await execFileAsync('node', [
      CLI_PATH,
      'compile',
      scriptPath,
    ]);

    expect(stdout).toContain('let result = (5 + 3) * 2;');
    expect(stdout).toContain('let flag = true && false || !false;');
  });
});
