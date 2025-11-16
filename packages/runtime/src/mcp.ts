// MCP server management
import { MCPServerConfig } from './types.js';

export class MCPServerManager {
  private servers = new Map<string, MCPServerConfig>();

  registerServer(name: string, config: MCPServerConfig): void {
    this.servers.set(name, config);
  }

  getServer(name: string): MCPServerConfig | undefined {
    return this.servers.get(name);
  }
}

/**
 * Create a tool proxy object for an MCP server
 * This wraps the tools array with convenient method-style access
 */
export function createToolProxy(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tools: Array<any>
): Record<string, (...args: unknown[]) => Promise<unknown>> {
  const proxy: Record<string, (...args: unknown[]) => Promise<unknown>> = {};

  for (const tool of tools) {
    proxy[tool.metadata.name] = async (...args: unknown[]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let toolInput: any;

      // If single object argument, use as-is (explicit parameter object)
      if (
        args.length === 1 &&
        typeof args[0] === 'object' &&
        !Array.isArray(args[0])
      ) {
        toolInput = args[0];
      } else {
        // Map positional arguments to schema parameter names
        const params = tool.metadata.parameters;

        if (params && params.properties) {
          // Get parameter names from the schema
          const paramNames = Object.keys(params.properties);
          toolInput = {};
          paramNames.forEach((paramName: string, index: number) => {
            if (index < args.length) {
              toolInput[paramName] = args[index];
            }
          });
        } else {
          // Fallback: use generic numbered parameters if no schema
          toolInput = Object.fromEntries(
            args.map((arg, index) => [`arg${index}`, arg])
          );
        }
      }

      // Call the tool with the mapped input
      const result = await tool.call(toolInput);

      // Extract text content from the result if it's in MCP format
      if (result && result.content && Array.isArray(result.content)) {
        return result.content[0]?.type === 'text'
          ? result.content[0].text
          : result.content;
      }

      return result;
    };
  }

  return proxy;
}
