// @mcpscript/cli - Command line interface
import { Command } from 'commander';
import { runCommand, compileCommand } from './commands/index.js';
import type { RunOptions, CompileOptions } from './types.js';
import packageJson from '../package.json' with { type: 'json' };

// Re-export types for consumers
export type { RunOptions, CompileOptions } from './types.js';

export async function main(args: string[]): Promise<void> {
  const program = new Command();

  program
    .name('mcps')
    .description(packageJson.description)
    .version(packageJson.version);

  program
    .command('run <file>')
    .description('Run a MCP Script file')
    .option(
      '-t, --timeout <ms>',
      'execution timeout in milliseconds (0 = no timeout)',
      '30000'
    )
    .action(async (file: string, cmdOptions: { timeout: string }) => {
      const timeout = parseInt(cmdOptions.timeout, 10);
      if (isNaN(timeout) || timeout < 0) {
        console.error('Error: timeout must be a non-negative number');
        process.exit(1);
      }

      const options: RunOptions = {
        file,
        timeout: timeout === 0 ? 0 : timeout,
      };
      await runCommand(options);
    });

  program
    .command('compile <file>')
    .description('Compile a MCP Script file to JavaScript and print to stdout')
    .action(async (file: string) => {
      const options: CompileOptions = {
        file,
      };
      await compileCommand(options);
    });

  await program.parseAsync(args, { from: 'user' });
}
