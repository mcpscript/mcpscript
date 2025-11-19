// VM-based script execution with dependency injection
import vm from 'vm';
import { mcp } from './mcp-client.js';
import {
  createPrint,
  createPrintChatMessage,
  createInput,
  log,
  env,
  createSet,
  createMap,
  type RuntimeHandlers,
} from './globals.js';
import { OpenAI } from '@llamaindex/openai';
import { Anthropic } from '@llamaindex/anthropic';
import { Gemini } from '@llamaindex/google';
import { Conversation, pipe } from './conversation.js';
import { createAgent } from './agent.js';
import { createToolProxy, createUserTool } from './mcp.js';
import type { AppMessage } from './types.js';

/**
 * Create a VM context with all required dependencies injected
 */
function createVMContext(handlers: RuntimeHandlers): vm.Context {
  // Create a safe subset of process object
  const safeProcess = {
    env: process.env,
    cwd: process.cwd,
    version: process.version,
    platform: process.platform,
    arch: process.arch,
  };

  const context = {
    // LlamaIndex MCP adapter
    __llamaindex_mcp: mcp,

    // Runtime functions (created with injected handlers)
    print: createPrint(handlers.addMessage),
    printChatMessage: createPrintChatMessage(handlers.addMessage),
    log: log,
    env: env,
    input: createInput(handlers.userInput),

    // LlamaIndex model classes
    __llamaindex_OpenAI: OpenAI,
    __llamaindex_Anthropic: Anthropic,
    __llamaindex_Gemini: Gemini,

    // Runtime classes
    __Conversation: Conversation,
    __Agent: createAgent(createPrintChatMessage(handlers.addMessage)),

    // MCP utility functions
    __createToolProxy: createToolProxy,
    __createUserTool: createUserTool,

    // Pipe operator function
    __pipe: pipe,

    // App message function for UI integration
    __addAppMessage: handlers.addMessage,

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

    // Collections (wrapper functions that don't require 'new' keyword)
    Set: createSet,
    Map: createMap,

    // Math and other safe globals
    Math: Math,
    Date: Date,
    RegExp: RegExp,

    // Constructor functions
    Object: Object,
    Array: Array,
    String: String,
    Number: Number,
    Boolean: Boolean,

    // Parsing utilities
    parseInt: parseInt,
    parseFloat: parseFloat,
    isNaN: isNaN,
    isFinite: isFinite,

    // URI encoding/decoding
    encodeURIComponent: encodeURIComponent,
    decodeURIComponent: decodeURIComponent,
    encodeURI: encodeURI,
    decodeURI: decodeURI,

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
  /** Callback to add a message to the app state from within the VM */
  addMessage?: (msg: AppMessage) => void;
  /** Callback to request user input from within the VM */
  userInput?: (message: string) => Promise<string>;
}

/**
 * Execute JavaScript code in a sandboxed VM with injected dependencies
 */
export async function executeInVM(
  code: string,
  options: VMExecutionOptions = {}
): Promise<Record<string, unknown>> {
  // Create VM context with injected handlers
  const context = createVMContext({
    addMessage: options.addMessage,
    userInput: options.userInput,
  });

  // Wrap code to assign variables to the context for test access
  // We convert 'let variable = value' to 'this.variable = value'
  // so that variables are accessible on the context after execution
  const wrappedCode = `
(async function() {
${code.replace(/\blet\s+(\w+)/g, 'this.$1')}
}).call(this)`;

  // Execute the code in the VM context
  const script = new vm.Script(wrappedCode);
  const vmOptions: vm.RunningScriptOptions = {
    displayErrors: true,
  };

  // Add timeout if specified (0 means no timeout)
  if (options.timeout !== 0) {
    vmOptions.timeout = options.timeout ?? 30000;
  }

  try {
    const result = script.runInContext(context, vmOptions);

    // Wait for the async function to complete
    if (result && typeof result.then === 'function') {
      await result;
    }

    // Return the context so tests can access variables
    return context as Record<string, unknown>;
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
