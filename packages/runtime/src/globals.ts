// Global functions available in MCP Script

export function print(...values: unknown[]): void {
  console.log(...values);
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
