// MCP server management
import { MCPServerConfig } from './types.js';
import { FunctionTool } from '@llamaindex/core/tools';
import { z } from 'zod';

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
 * Uses Proxy to expose __mcp_tools metadata (similar to user-defined tools)
 */
export function createToolProxy(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tools: Array<any>
): Record<string, (...args: unknown[]) => Promise<unknown>> {
  const target: Record<string, (...args: unknown[]) => Promise<unknown>> = {};

  for (const tool of tools) {
    target[tool.metadata.name] = async (...args: unknown[]) => {
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

  // Wrap in Proxy to expose __mcp_tools metadata
  return new Proxy(target, {
    get(target, prop) {
      if (prop === '__mcp_tools') return tools;
      return target[prop as string];
    },
    has(target, prop) {
      if (prop === '__mcp_tools') return true;
      return prop in target;
    },
  });
}

/**
 * Create a user-defined tool with metadata attached via Proxy
 * This wraps an async function with __mcps_params and __mcps_name metadata
 */
export function createUserTool(
  name: string,
  params: string[],
  func: (...args: unknown[]) => Promise<unknown>
): (...args: unknown[]) => Promise<unknown> {
  return new Proxy(func, {
    get(target, prop) {
      if (prop === '__mcps_params') return params;
      if (prop === '__mcps_name') return name;
      return Reflect.get(target, prop);
    },
    apply(target, thisArg, args) {
      return target.apply(thisArg, args);
    },
  });
}

/**
 * Wrap a user-defined MCP Script tool as a LlamaIndex FunctionTool
 * This allows user-defined tools to be used by agents alongside MCP tools
 * Uses Zod for schema validation
 */
export function wrapToolForAgent(
  toolName: string,
  toolFunction: (...args: unknown[]) => Promise<unknown>,
  parameterNames: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  // Build a Zod schema dynamically from parameter names
  const schemaShape: Record<string, z.ZodString> = {};
  for (const paramName of parameterNames) {
    // Default to string for now (type annotations not yet implemented)
    schemaShape[paramName] = z.string().describe(`Parameter: ${paramName}`);
  }

  // Create a Zod object schema
  const zodSchema = z.object(schemaShape);

  // Create the FunctionTool using LlamaIndex's FunctionTool.from with Zod schema
  return FunctionTool.from(
    async (input: z.infer<typeof zodSchema>) => {
      // Convert the input object to positional arguments
      const args = parameterNames.map(name => input[name]);
      const result = await toolFunction(...args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return result as any;
    },
    {
      name: toolName,
      description: `User-defined tool: ${toolName}`,
      parameters: zodSchema,
    }
  );
}
