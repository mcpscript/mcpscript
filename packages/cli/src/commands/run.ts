// mcps run command
import { readFile } from 'fs/promises';
import { parseSource, generateCode } from '@mcps/transpiler';
import { executeInVM } from '@mcps/runtime';
import type { RunOptions } from '../types.js';

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

    // Execute the generated JavaScript in VM
    await executeInVM(jsCode, { timeout: options.timeout });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error('An unknown error occurred');
    }
    process.exit(1);
  }
}
