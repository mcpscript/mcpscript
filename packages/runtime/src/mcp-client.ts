// Custom MCP client implementation with roots support
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import type { StdioServerParameters } from '@modelcontextprotocol/sdk/client/stdio.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import type { SSEClientTransportOptions } from '@modelcontextprotocol/sdk/client/sse.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { StreamableHTTPClientTransportOptions } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { ListRootsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { FunctionTool } from '@llamaindex/core/tools';
import type { BaseToolWithCall } from '@llamaindex/core/llms';
import { pathToFileURL } from 'url';
import { createRequire } from 'module';

// Import package.json to get version
const require = createRequire(import.meta.url);
const packageJson = require('../package.json') as { version: string };

/**
 * Common options for all MCP clients
 */
type MCPCommonOptions = {
  /** The prefix to add to the tool name */
  toolNamePrefix?: string;
  /** The name of the client */
  clientName?: string;
};

/**
 * Options for URL-based MCP clients (HTTP/SSE)
 */
type URLMCPOptions = MCPCommonOptions & {
  url: string;
  /** Use SSE transport (deprecated, use StreamableHTTP instead) */
  useSSETransport?: boolean;
};

/**
 * Options for stdio-based MCP clients
 */
type StdioMCPClientOptions = StdioServerParameters & MCPCommonOptions;

/**
 * Options for SSE-based MCP clients (deprecated)
 */
type SSEMCPClientOptions = SSEClientTransportOptions & URLMCPOptions;

/**
 * Options for StreamableHTTP-based MCP clients
 */
type StreamableHTTPMCPClientOptions = StreamableHTTPClientTransportOptions &
  URLMCPOptions;

/**
 * Union of all MCP client option types
 */
export type MCPClientOptions =
  | StdioMCPClientOptions
  | SSEMCPClientOptions
  | StreamableHTTPMCPClientOptions;

/**
 * Custom MCP Client with roots support
 * This replaces the LlamaIndex mcp() function to add support for the roots protocol
 */
export class MCPClient {
  private client: Client;
  private transport: Transport | null = null;
  private toolNamePrefix?: string;
  private connected = false;

  constructor(options: MCPClientOptions) {
    // Initialize MCP SDK client with capabilities
    this.client = new Client(
      {
        name: options.clientName ?? 'mcp-script-client',
        version: packageJson.version,
      },
      {
        capabilities: {
          // Enable roots support
          roots: {
            listChanged: true,
          },
        },
      }
    );

    this.toolNamePrefix = options.toolNamePrefix;

    // Set up request handlers
    this.setupRequestHandlers();

    // Create appropriate transport
    if ('url' in options) {
      const useSSETransport = options.useSSETransport ?? false;
      if (useSSETransport) {
        this.transport = new SSEClientTransport(
          new URL(options.url),
          options as SSEClientTransportOptions
        );
      } else {
        this.transport = new StreamableHTTPClientTransport(
          new URL(options.url),
          options as StreamableHTTPClientTransportOptions
        );
      }
    } else {
      this.transport = new StdioClientTransport(
        options as StdioServerParameters
      );
    }
  }

  /**
   * Set up request handlers for the MCP client
   * This includes the roots/list handler to provide the current working directory
   */
  private setupRequestHandlers(): void {
    // Handle roots/list requests from the server
    this.client.setRequestHandler(ListRootsRequestSchema, async () => {
      const cwd = process.cwd();
      const cwdUri = pathToFileURL(cwd).href;

      return {
        roots: [
          {
            uri: cwdUri,
            name: 'Current Working Directory',
          },
        ],
      };
    });
  }

  /**
   * Connect to the MCP server
   */
  async connectToServer(): Promise<void> {
    if (!this.transport) {
      throw new Error('Initialized with invalid options');
    }

    await this.client.connect(this.transport);
    this.connected = true;
  }

  /**
   * List tools available from the MCP server
   */
  private async listTools() {
    if (!this.connected) {
      await this.connectToServer();
    }

    const result = await this.client.listTools();
    return result.tools;
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    await this.client.close();
    await this.transport?.close();
  }

  /**
   * Get the tools from the MCP server and map to LlamaIndex tools
   */
  async tools(): Promise<BaseToolWithCall[]> {
    const mcpTools = await this.listTools();

    return mcpTools.map(tool => {
      const parameters = tool.inputSchema;

      const functionTool = FunctionTool.from(
        async (input: Record<string, unknown>) => {
          const result = await this.client.callTool({
            name: tool.name,
            arguments: input,
          });

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return result as any;
        },
        {
          name: this.toolNamePrefix
            ? `${this.toolNamePrefix}_${tool.name}`
            : tool.name,
          description: tool.description ?? '',
          parameters,
        }
      );

      return functionTool;
    });
  }
}

/**
 * Create a MCP client with roots support
 * This is a drop-in replacement for the LlamaIndex mcp() function
 * @param options - The options for the MCP client
 * @returns A MCP client
 */
export function mcp(options: MCPClientOptions): MCPClient {
  return new MCPClient(options);
}
