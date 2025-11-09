// mcps run command
import { readFile, writeFile, unlink } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import { parseSource, generateCode } from '@mcps/transpiler';
import type { RunOptions } from '../types.js';

const execAsync = promisify(exec);

export async function runCommand(options: RunOptions): Promise<void> {
  const { file } = options;

  if (!file.endsWith('.mcps')) {
    console.error('Error: File must have .mcps extension');
    process.exit(1);
  }

  try {
    // Read the source file
    const source = await readFile(file, 'utf-8');

    // Parse the source
    const ast = parseSource(source);

    // Generate JavaScript code
    const jsCode = generateCode(ast);

    // Write to a temporary file
    const tempFile = `.tmp_mcps_${Date.now()}.mjs`;
    await writeFile(tempFile, jsCode, 'utf-8');

    try {
      // Execute the generated JavaScript
      const { stdout, stderr } = await execAsync(`node ${tempFile}`);

      if (stdout) {
        console.log(stdout);
      }
      if (stderr) {
        console.error(stderr);
      }
    } finally {
      // Clean up the temporary file
      try {
        await unlink(tempFile);
      } catch (_) {
        // Ignore cleanup errors
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error('An unknown error occurred');
    }
    process.exit(1);
  }
}
