// mcps run command
import React from 'react';
import { readFile } from 'fs/promises';
import { render } from 'ink';
import { config as dotenvConfig } from 'dotenv';
import { parseSource, generateCode } from '@mcpscript/transpiler';
import { AppMessage, AppState, executeInVM } from '@mcpscript/runtime';
import type { RunOptions } from '../types.js';
import { App } from '../ui/App.js';

export async function runCommand(options: RunOptions): Promise<void> {
  const { file } = options;

  // Load environment variables from .env file
  dotenvConfig();

  if (!file.endsWith('.mcps')) {
    console.error('Error: File must have .mcps extension');
    process.exit(1);
  }

  // Initialize application state
  let appState: AppState = {
    messages: [],
  };

  // Render the Ink app
  const { rerender, waitUntilExit } = render(<App state={appState} />, {
    stdout: process.stderr,
    stderr: process.stderr,
  });

  // State updater function that can be called from VM
  const addMessage = (msg: AppMessage) => {
    appState.messages.push(msg);
    appState = { ...appState };
    rerender(<App state={appState} />);
  };

  // User input handler function that can be called from VM
  const handleUserInput = (message: string): Promise<string> => {
    return new Promise<string>(resolve => {
      appState.userInput = {
        message,
        onSubmit: (value: string) => {
          appState.userInput = undefined;
          rerender(<App state={appState} />);
          resolve(value);
        },
      };
      rerender(<App state={appState} />);
    });
  };

  try {
    // Read the source file
    const source = await readFile(file, 'utf-8');

    // Parse the source
    const ast = parseSource(source);

    // Generate JavaScript code
    const jsCode = generateCode(ast);

    // Execute the generated JavaScript in VM
    await executeInVM(jsCode, {
      timeout: options.timeout,
      addMessage: addMessage,
      userInput: handleUserInput,
    });

    // Wait for user to exit
    await waitUntilExit();
  } catch (_) {
    // Wait a bit for user to see the error
    await waitUntilExit();
    process.exit(1);
  }
}
