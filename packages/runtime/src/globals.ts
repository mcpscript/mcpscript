// Global functions available in MCP Script

import { ChatMessage } from 'llamaindex';
import { AppMessage } from './types';

/**
 * Add message callback type for UI integration
 */
export type AddMessageHandler = (msg: AppMessage) => void;

/**
 * User input callback type for UI integration
 */
export type UserInputHandler = (message: string) => Promise<string>;

/**
 * Print chat message callback type for agent integration
 */
export type PrintChatMessageFn = (agentName: string, msg: ChatMessage) => void;

/**
 * Runtime handlers that can be injected into the VM context
 */
export interface RuntimeHandlers {
  addMessage?: AddMessageHandler;
  userInput?: UserInputHandler;
}

/**
 * Create a print function with the given handler
 */
export function createPrint(addMessage?: AddMessageHandler) {
  return function print(...values: unknown[]): void {
    if (addMessage) {
      const message = values.map(v => String(v)).join(' ');
      addMessage({ title: '', body: message });
    } else {
      console.log(...values);
    }
  };
}

/**
 * Create a printChatMessage function with the given handler
 */
export function createPrintChatMessage(addMessage?: AddMessageHandler) {
  return function printChatMessage(agentName: string, msg: ChatMessage): void {
    const content =
      typeof msg.content === 'string'
        ? msg.content
        : JSON.stringify(msg.content);
    const author = msg.role === 'user' ? 'User' : `Agent[${agentName}]`;
    addMessage?.({ title: author, body: content });
  };
}

/**
 * Structured logging system for MCP Script
 */
export const log = {
  /**
   * Log debug-level messages (typically for detailed diagnostic information)
   */
  debug(...values: unknown[]): void {
    console.debug('[DEBUG]', ...values);
  },

  /**
   * Log info-level messages (general informational messages)
   */
  info(...values: unknown[]): void {
    console.info('[INFO]', ...values);
  },

  /**
   * Log warning-level messages (warnings about potential issues)
   */
  warn(...values: unknown[]): void {
    console.warn('[WARN]', ...values);
  },

  /**
   * Log error-level messages (error conditions)
   */
  error(...values: unknown[]): void {
    console.error('[ERROR]', ...values);
  },
};

/**
 * Environment variable access for MCP Script
 * Provides read-only access to process environment variables
 */
export const env = new Proxy(
  {},
  {
    get(_target, prop: string): string | undefined {
      return process.env[prop];
    },
    set(_target, _prop: string, _value: unknown): boolean {
      throw new Error('Environment variables are read-only');
    },
  }
);

/**
 * Create a Set without requiring the 'new' keyword
 * @param iterable Optional iterable to initialize the Set
 * @returns A new Set instance
 */
export function createSet<T = unknown>(iterable?: Iterable<T>): Set<T> {
  return new Set(iterable);
}

/**
 * Create a Map without requiring the 'new' keyword
 * @param iterable Optional iterable of key-value pairs to initialize the Map
 * @returns A new Map instance
 */
export function createMap<K = unknown, V = unknown>(
  iterable?: Iterable<readonly [K, V]>
): Map<K, V> {
  return new Map(iterable);
}

/**
 * Create an input function with the given handler
 */
export function createInput(userInputHandler?: UserInputHandler) {
  return async function input(message: string): Promise<string> {
    if (!userInputHandler) {
      throw new Error(
        'User input handler not configured. Cannot get user input.'
      );
    }
    return await userInputHandler(message);
  };
}
