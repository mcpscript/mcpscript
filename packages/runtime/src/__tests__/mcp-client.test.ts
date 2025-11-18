// Test for MCP client with roots support
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MCPClient, mcp } from '../mcp-client.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

// Mock the MCP SDK modules
vi.mock('@modelcontextprotocol/sdk/client/index.js');
vi.mock('@modelcontextprotocol/sdk/client/stdio.js');
vi.mock('@modelcontextprotocol/sdk/client/sse.js');
vi.mock('@modelcontextprotocol/sdk/client/streamableHttp.js');

describe('MCPClient', () => {
  let mockClient: {
    connect: ReturnType<typeof vi.fn>;
    setRequestHandler: ReturnType<typeof vi.fn>;
    listTools: ReturnType<typeof vi.fn>;
    callTool: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Create mock client methods
    mockClient = {
      connect: vi.fn().mockResolvedValue(undefined),
      setRequestHandler: vi.fn(),
      listTools: vi.fn().mockResolvedValue({ tools: [] }),
      callTool: vi.fn().mockResolvedValue({ content: [] }),
      close: vi.fn().mockResolvedValue(undefined),
    };

    /* eslint-disable @typescript-eslint/no-explicit-any */

    // Mock the Client constructor to return the mock client
    (Client as any).mockImplementation(function (this: any) {
      return mockClient;
    });

    // Mock transport constructors to return mock transports
    const mockTransport = { close: vi.fn().mockResolvedValue(undefined) };
    (StdioClientTransport as any).mockImplementation(function (this: any) {
      return mockTransport;
    });
    (SSEClientTransport as any).mockImplementation(function (this: any) {
      return mockTransport;
    });
    (StreamableHTTPClientTransport as any).mockImplementation(function (
      this: any
    ) {
      return mockTransport;
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constructor and Initialization', () => {
    it('should create an MCP client with stdio transport', () => {
      const client = new MCPClient({
        command: 'test-command',
        args: ['arg1', 'arg2'],
      });

      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(MCPClient);
      expect(Client).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'mcp-script-client',
          version: expect.any(String),
        }),
        expect.objectContaining({
          capabilities: {
            roots: {
              listChanged: true,
            },
          },
        })
      );
      expect(StdioClientTransport).toHaveBeenCalledWith({
        command: 'test-command',
        args: ['arg1', 'arg2'],
      });
    });

    it('should create an MCP client with StreamableHTTP transport', () => {
      const client = new MCPClient({
        url: 'http://localhost:8000/mcp',
      });

      expect(client).toBeDefined();
      expect(StreamableHTTPClientTransport).toHaveBeenCalledWith(
        new URL('http://localhost:8000/mcp'),
        expect.objectContaining({ url: 'http://localhost:8000/mcp' })
      );
    });

    it('should create an MCP client with SSE transport when useSSETransport is true', () => {
      const client = new MCPClient({
        url: 'http://localhost:8000/sse',
        useSSETransport: true,
      });

      expect(client).toBeDefined();
      expect(SSEClientTransport).toHaveBeenCalledWith(
        new URL('http://localhost:8000/sse'),
        expect.objectContaining({
          url: 'http://localhost:8000/sse',
          useSSETransport: true,
        })
      );
    });

    it('should use custom client name when provided', () => {
      new MCPClient({
        command: 'test',
        args: [],
        clientName: 'custom-client',
      });

      expect(Client).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'custom-client',
        }),
        expect.any(Object)
      );
    });

    it('should use default client name when not provided', () => {
      new MCPClient({
        command: 'test',
        args: [],
      });

      expect(Client).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'mcp-script-client',
        }),
        expect.any(Object)
      );
    });

    it('should register roots/list request handler', () => {
      new MCPClient({
        command: 'test',
        args: [],
      });

      expect(mockClient.setRequestHandler).toHaveBeenCalledTimes(1);
      expect(mockClient.setRequestHandler).toHaveBeenCalledWith(
        expect.any(Object), // ListRootsRequestSchema
        expect.any(Function)
      );
    });
  });

  describe('Roots Protocol', () => {
    it('should return current working directory as root when requested', async () => {
      new MCPClient({
        command: 'test',
        args: [],
      });

      // Get the registered handler
      const handlerCall = mockClient.setRequestHandler.mock.calls[0];
      const handler = handlerCall[1];

      // Call the handler
      const result = await handler();

      expect(result).toEqual({
        roots: [
          {
            uri: expect.stringMatching(/^file:\/\//),
            name: 'Current Working Directory',
          },
        ],
      });
      expect(result.roots[0].uri).toContain(process.cwd());
    });
  });

  describe('Connection', () => {
    it('should connect to server successfully', async () => {
      const client = new MCPClient({
        command: 'test',
        args: [],
      });

      await client.connectToServer();

      expect(mockClient.connect).toHaveBeenCalledTimes(1);
      expect(mockClient.connect).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should throw error if transport is not initialized', async () => {
      const client = new MCPClient({
        command: 'test',
        args: [],
      });

      // Set transport to null to simulate initialization failure
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client as any).transport = null;

      await expect(client.connectToServer()).rejects.toThrow(
        'Initialized with invalid options'
      );
    });
  });

  describe('Tools', () => {
    it('should list and wrap tools correctly', async () => {
      const mockTools = [
        {
          name: 'test_tool',
          description: 'A test tool',
          inputSchema: {
            type: 'object',
            properties: {
              input: { type: 'string' },
            },
          },
        },
        {
          name: 'another_tool',
          description: 'Another tool',
          inputSchema: {
            type: 'object',
            properties: {
              value: { type: 'number' },
            },
          },
        },
      ];

      mockClient.listTools.mockResolvedValue({ tools: mockTools });

      const client = new MCPClient({
        command: 'test',
        args: [],
      });

      const tools = await client.tools();

      expect(tools).toHaveLength(2);
      expect(mockClient.listTools).toHaveBeenCalledTimes(1);
    });

    it('should apply tool name prefix when specified', async () => {
      const mockTools = [
        {
          name: 'test_tool',
          description: 'A test tool',
          inputSchema: { type: 'object', properties: {} },
        },
      ];

      mockClient.listTools.mockResolvedValue({ tools: mockTools });

      const client = new MCPClient({
        command: 'test',
        args: [],
        toolNamePrefix: 'myprefix',
      });

      const tools = await client.tools();

      expect(tools).toHaveLength(1);
      // Check that the tool has the prefixed name
      expect(tools[0].metadata.name).toBe('myprefix_test_tool');
    });

    it('should not apply prefix when not specified', async () => {
      const mockTools = [
        {
          name: 'test_tool',
          description: 'A test tool',
          inputSchema: { type: 'object', properties: {} },
        },
      ];

      mockClient.listTools.mockResolvedValue({ tools: mockTools });

      const client = new MCPClient({
        command: 'test',
        args: [],
      });

      const tools = await client.tools();

      expect(tools).toHaveLength(1);
      expect(tools[0].metadata.name).toBe('test_tool');
    });

    it('should call MCP tool when wrapped tool is invoked', async () => {
      const mockTools = [
        {
          name: 'test_tool',
          description: 'A test tool',
          inputSchema: {
            type: 'object',
            properties: {
              input: { type: 'string' },
            },
          },
        },
      ];

      const mockResult = {
        content: [{ type: 'text', text: 'Tool result' }],
      };

      mockClient.listTools.mockResolvedValue({ tools: mockTools });
      mockClient.callTool.mockResolvedValue(mockResult);

      const client = new MCPClient({
        command: 'test',
        args: [],
      });

      const tools = await client.tools();
      const tool = tools[0];

      const result = await tool.call({ input: 'test input' });

      expect(mockClient.callTool).toHaveBeenCalledWith({
        name: 'test_tool',
        arguments: { input: 'test input' },
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('Cleanup', () => {
    it('should close client and transport on cleanup', async () => {
      const mockTransport = {
        close: vi.fn().mockResolvedValue(undefined),
      };

      /* eslint-disable @typescript-eslint/no-explicit-any */
      (StdioClientTransport as any).mockImplementationOnce(function (
        this: any
      ) {
        return mockTransport;
      });
      /* eslint-enable @typescript-eslint/no-explicit-any */

      const client = new MCPClient({
        command: 'test',
        args: [],
      });

      await client.cleanup();

      expect(mockClient.close).toHaveBeenCalledTimes(1);
      expect(mockTransport.close).toHaveBeenCalledTimes(1);
    });
  });

  describe('mcp() factory function', () => {
    it('should create and return an MCPClient instance', () => {
      const client = mcp({
        command: 'test',
        args: [],
      });

      expect(client).toBeInstanceOf(MCPClient);
    });
  });
});
