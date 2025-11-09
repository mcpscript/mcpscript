// VM-based script execution with dependency injection
import vm from 'vm';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { WebSocketClientTransport } from '@modelcontextprotocol/sdk/client/websocket.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { print } from './globals.js';

/**
 * Create a VM context with all required dependencies injected
 */
function createVMContext(): vm.Context {
  // Create a safe subset of process object
  const safeProcess = {
    env: process.env,
    cwd: process.cwd,
    version: process.version,
    platform: process.platform,
    arch: process.arch,
  };

  // Create logging functions
  const log = {
    debug: (message: string, data?: unknown) =>
      console.debug(`[DEBUG] ${message}`, data || ''),
    info: (message: string, data?: unknown) =>
      console.info(`[INFO] ${message}`, data || ''),
    warn: (message: string, data?: unknown) =>
      console.warn(`[WARN] ${message}`, data || ''),
    error: (message: string, data?: unknown) =>
      console.error(`[ERROR] ${message}`, data || ''),
  };

  // Environment variable access
  const env = new Proxy(
    {},
    {
      get: (_, prop) => {
        if (typeof prop === 'string') {
          return process.env[prop];
        }
        return undefined;
      },
    }
  );

  const context = {
    // MCP SDK components
    MCPClient: Client,
    StdioClientTransport: StdioClientTransport,
    WebSocketClientTransport: WebSocketClientTransport,
    StreamableHTTPClientTransport: StreamableHTTPClientTransport,
    SSEClientTransport: SSEClientTransport,

    // Runtime functions
    print: print,
    log: log,
    env: env,

    // Standard APIs (limited)
    console: console,
    process: safeProcess,

    // Global objects needed for JavaScript execution
    global: undefined, // Block access to global
    globalThis: undefined, // Block access to globalThis
    Buffer: Buffer,
    URL: URL,
    URLSearchParams: URLSearchParams,

    // Async utilities
    Promise: Promise,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,

    // JSON utilities
    JSON: JSON,

    // Math and other safe globals
    Math: Math,
    Date: Date,
    RegExp: RegExp,

    // Error types
    Error: Error,
    TypeError: TypeError,
    RangeError: RangeError,
    SyntaxError: SyntaxError,
  };

  return vm.createContext(context);
}

/**
 * Options for VM execution
 */
export interface VMExecutionOptions {
  /** Timeout in milliseconds. Set to 0 for no timeout. Default: 30000 (30s) */
  timeout?: number;
}

/**
 * Execute JavaScript code in a sandboxed VM with injected dependencies
 */
export async function executeInVM(
  code: string,
  options: VMExecutionOptions = {}
): Promise<void> {
  const context = createVMContext();

  try {
    // Create an async function wrapper to handle top-level await
    const wrappedCode = `
(async function() {
${code}
})()`;

    // Execute the code in the VM context
    const script = new vm.Script(wrappedCode);
    const vmOptions: vm.RunningScriptOptions = {
      displayErrors: true,
    };

    // Add timeout if specified (0 means no timeout)
    if (options.timeout !== 0) {
      vmOptions.timeout = options.timeout ?? 30000;
    }

    const result = script.runInContext(context, vmOptions);

    // Wait for the async function to complete
    if (result && typeof result.then === 'function') {
      await result;
    }
  } catch (error) {
    if (error instanceof Error) {
      // Clean up the stack trace to remove VM internals
      const cleanStack = error.stack
        ?.split('\n')
        .filter(
          line => !line.includes('vm.js') && !line.includes('vm-executor')
        )
        .join('\n');

      const cleanError = new Error(error.message);
      cleanError.stack = cleanStack;
      throw cleanError;
    } else {
      throw error;
    }
  }
}

export { createVMContext };
