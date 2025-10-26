// mcps build command
import type { BuildOptions } from '../types.js';

export async function buildCommand(options: BuildOptions): Promise<void> {
  const { file, output } = options;

  if (!file.endsWith('.mcps')) {
    console.error('Error: File must have .mcps extension');
    process.exit(1);
  }

  // TODO: Implement transpilation to JavaScript
  console.log(`Building ${file} to ${output}...`);
  throw new Error('Build command not yet implemented');
}
