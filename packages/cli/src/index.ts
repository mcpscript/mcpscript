// @mcps/cli - Command line interface
import { Command } from 'commander';
import { runCommand, buildCommand } from './commands/index.js';
import type { RunOptions, BuildOptions } from './types.js';
import packageJson from '../package.json' with { type: 'json' };

export async function main(args: string[]): Promise<void> {
  const program = new Command();

  program
    .name('mcps')
    .description(packageJson.description)
    .version(packageJson.version);

  program
    .command('run <file>')
    .description('Run a MCP Script file')
    .action(async (file: string) => {
      const options: RunOptions = { file };
      await runCommand(options);
    });

  program
    .command('build <file>')
    .description('Build a MCP Script file to JavaScript')
    .option('-o, --output <path>', 'output directory', './dist')
    .action(async (file: string, options: { output: string }) => {
      const buildOptions: BuildOptions = { file, output: options.output };
      await buildCommand(buildOptions);
    });

  await program.parseAsync(args, { from: 'user' });
}
