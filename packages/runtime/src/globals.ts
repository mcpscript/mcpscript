// Global functions available in MCP Script

import { ChatMessage } from 'llamaindex';
import { AppMessage } from './types';

/**
 * Add message callback type for UI integration
 */
type AddMessageHandler = (msg: AppMessage) => void;

/**
 * Add message callback for UI integration
 */
let addMessage: AddMessageHandler | null = null;

/**
 * Configure print function for UI integration
 */
export function configurePrint(
  addMessageHandler: AddMessageHandler | null
): void {
  addMessage = addMessageHandler;
}

/**
 * Print output. Integrates with UI when configured, otherwise uses console.log
 */
export function print(...values: unknown[]): void {
  if (addMessage) {
    const message = values.map(v => String(v)).join(' ');
    addMessage({ title: '', body: message });
  } else {
    console.log(...values);
  }
}

export function printChatMessage(agentName: string, msg: ChatMessage): void {
  const content =
    typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
  const author = msg.role === 'user' ? 'User' : `Agent[${agentName}]`;
  addMessage?.({ title: author, body: content });
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
