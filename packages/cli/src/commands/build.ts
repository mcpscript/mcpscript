// mcps build command
import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname, basename, join } from 'path';
import { parseSource, generateCode } from '@mcps/transpiler';
import type { BuildOptions } from '../types.js';

export async function buildCommand(options: BuildOptions): Promise<void> {
  const { file, output } = options;

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

    // Determine output file path
    const baseFilename = basename(file, '.mcps');
    const outputFile = join(output, `${baseFilename}.mjs`);

    // Ensure output directory exists
    await mkdir(output, { recursive: true });

    // Write the generated JavaScript
    await writeFile(outputFile, jsCode, 'utf-8');

    console.log(`✓ Built ${file} → ${outputFile}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error('An unknown error occurred');
    }
    process.exit(1);
  }
}
