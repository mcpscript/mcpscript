// mcps run command
import type { RunOptions } from '../types.js';

export async function runCommand(options: RunOptions): Promise<void> {
  const { file } = options;

  if (!file.endsWith('.mcps')) {
    console.error('Error: File must have .mcps extension');
    process.exit(1);
  }

  // TODO: Implement transpilation and execution
  console.log(`Running ${file}...`);
  throw new Error('Run command not yet implemented');
}
