// mcps compile command
import { readFile } from 'fs/promises';
import { parseSource, generateCode } from '@mcpscript/transpiler';
import type { CompileOptions } from '../types.js';

export async function compileCommand(options: CompileOptions): Promise<void> {
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

    // Print to stdout
    console.log(jsCode);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      if (error.stack) {
        console.error('\nStack trace:');
        console.error(error.stack);
      }
    } else {
      console.error('An unknown error occurred:', error);
    }
    process.exit(1);
  }
}
