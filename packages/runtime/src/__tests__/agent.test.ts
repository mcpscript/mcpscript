// Tests for Agent runtime class
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Agent } from '../agent.js';
import { Conversation } from '../conversation.js';
import type { BaseLLM, ToolCall } from '@llamaindex/core/llms';
import type { BaseTool } from '@llamaindex/core/llms';
import { createUserTool } from '../mcp.js';
import { z } from 'zod';

describe('Agent', () => {
  let mockLLM: BaseLLM;
  let mockTool: BaseTool;

  beforeEach(() => {
    // Create a mock LLM
    mockLLM = {
      exec: vi.fn(),
    } as unknown as BaseLLM;

    // Create a mock tool
    mockTool = {
      metadata: {
        name: 'testTool',
        description: 'A test tool',
      },
      call: vi.fn(),
    } as unknown as BaseTool;
  });

  it('should create an agent with required configuration', () => {
    const agent = new Agent({
      name: 'TestAgent',
      llm: mockLLM,
    });

    expect(agent.name).toBe('TestAgent');
    expect(agent.description).toBeUndefined();
  });

  it('should create an agent with full configuration', () => {
    const agent = new Agent({
      name: 'TestAgent',
      description: 'A test agent',
      systemPrompt: 'You are a helpful assistant',
      llm: mockLLM,
      tools: [mockTool],
    });

    expect(agent.name).toBe('TestAgent');
    expect(agent.description).toBe('A test agent');
  });

  it('should run agent and return conversation', async () => {
    // Mock LLM to return a response with no tool calls (exit immediately)
    vi.mocked(mockLLM.exec).mockResolvedValue({
      newMessages: [
        {
          role: 'assistant',
          content: 'Hello! How can I help you?',
        },
      ],
      toolCalls: [],
    });

    const agent = new Agent({
      name: 'TestAgent',
      llm: mockLLM,
    });

    const conversation = await agent.run('Hello');

    expect(conversation).toBeDefined();
    expect(conversation.result()).toBe('Hello! How can I help you?');
    expect(mockLLM.exec).toHaveBeenCalledTimes(1);
  });

  it('should handle agent loop with tool calls', async () => {
    // First call: LLM requests a tool call
    // Second call: LLM returns final response
    vi.mocked(mockLLM.exec)
      .mockResolvedValueOnce({
        newMessages: [
          {
            role: 'assistant',
            content: 'Let me check that for you',
          },
        ],
        toolCalls: [{ id: 'call1' } as unknown as ToolCall],
      })
      .mockResolvedValueOnce({
        newMessages: [
          {
            role: 'assistant',
            content: 'Based on the tool result, the answer is 42',
          },
        ],
        toolCalls: [],
      });

    const agent = new Agent({
      name: 'TestAgent',
      llm: mockLLM,
      tools: [mockTool],
    });

    const conversation = await agent.run('What is the answer?');

    expect(conversation).toBeDefined();
    expect(conversation.result()).toBe(
      'Based on the tool result, the answer is 42'
    );
    expect(mockLLM.exec).toHaveBeenCalledTimes(2);
  });

  it('should include system prompt in messages', async () => {
    vi.mocked(mockLLM.exec).mockResolvedValue({
      newMessages: [
        {
          role: 'assistant',
          content: 'Response',
        },
      ],
      toolCalls: [],
    });

    const agent = new Agent({
      name: 'TestAgent',
      systemPrompt: 'You are a helpful assistant',
      llm: mockLLM,
    });

    await agent.run('Hello');

    expect(mockLLM.exec).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: 'You are a helpful assistant',
          }),
        ]),
      })
    );
  });

  it('should not include system prompt in final conversation', async () => {
    vi.mocked(mockLLM.exec).mockResolvedValue({
      newMessages: [
        {
          role: 'assistant',
          content: 'Response',
        },
      ],
      toolCalls: [],
    });

    const agent = new Agent({
      name: 'TestAgent',
      systemPrompt: 'You are a helpful assistant',
      llm: mockLLM,
    });

    const conversation = await agent.run('Hello');
    const messages = conversation.getMessages();

    // Should have user and assistant messages, but not system message
    expect(messages.length).toBe(2);
    expect(messages[0].role).toBe('user');
    expect(messages[1].role).toBe('assistant');
    expect(messages.some(m => m.role === 'system')).toBe(false);
  });

  it('should accept a Conversation object as input', async () => {
    vi.mocked(mockLLM.exec).mockResolvedValue({
      newMessages: [
        {
          role: 'assistant',
          content: 'Continuing the conversation',
        },
      ],
      toolCalls: [],
    });

    const agent = new Agent({
      name: 'TestAgent',
      llm: mockLLM,
    });

    // Create an initial conversation with history
    const initialConv = new Conversation('First message');
    initialConv.addMessage({
      role: 'assistant',
      content: 'First response',
    });
    initialConv.addMessage({
      role: 'user',
      content: 'Second message',
    });

    const resultConv = await agent.run(initialConv);
    const messages = resultConv.getMessages();

    // Should preserve the conversation history
    expect(messages.length).toBe(4); // 3 original + 1 new
    expect(messages[0].content).toBe('First message');
    expect(messages[1].content).toBe('First response');
    expect(messages[2].content).toBe('Second message');
    expect(messages[3].content).toBe('Continuing the conversation');
  });

  it('should accept a string as input (backward compatible)', async () => {
    vi.mocked(mockLLM.exec).mockResolvedValue({
      newMessages: [
        {
          role: 'assistant',
          content: 'Response to prompt',
        },
      ],
      toolCalls: [],
    });

    const agent = new Agent({
      name: 'TestAgent',
      llm: mockLLM,
    });

    const conversation = await agent.run('Hello');

    expect(conversation).toBeDefined();
    expect(conversation.result()).toBe('Response to prompt');
  });

  it('should pass typed tool schema to LLM during execution', async () => {
    // Create a typed tool with schema (simulating generated code)
    const schema = z.object({
      x: z.number(),
      y: z.number(),
    });

    const addTool = createUserTool(
      'add',
      ['x', 'y'],
      async (x: unknown, y: unknown) => {
        return (x as number) + (y as number);
      },
      schema
    );

    // Mock LLM to return immediately (we're just checking the tool schema passed)
    vi.mocked(mockLLM.exec).mockResolvedValue({
      newMessages: [
        {
          role: 'assistant',
          content: 'Result is 8',
        },
      ],
      toolCalls: [],
    });

    const agent = new Agent({
      name: 'Calculator',
      llm: mockLLM,
      tools: [addTool],
    });

    await agent.run('What is 5 plus 3?');

    // Verify llm.exec was called with tools
    expect(mockLLM.exec).toHaveBeenCalledTimes(1);
    const execCall = vi.mocked(mockLLM.exec).mock.calls[0][0];
    expect(execCall.tools).toBeDefined();
    expect(execCall.tools.length).toBe(1);

    // Verify the tool has correct metadata
    const tool = execCall.tools[0];
    expect(tool.metadata.name).toBe('add');
    expect(tool.metadata.parameters).toBeDefined();

    // Verify the schema contains correct type information
    const params = tool.metadata.parameters;
    expect(params.type).toBe('object');
    expect(params.properties).toBeDefined();
    expect(params.properties.x).toBeDefined();
    expect(params.properties.y).toBeDefined();
    expect(params.properties.x.type).toBe('number');
    expect(params.properties.y.type).toBe('number');
    expect(params.required).toEqual(['x', 'y']);
  });

  it('should pass complex typed tool schema to LLM', async () => {
    // Create a tool with multiple types including optional parameters
    const schema = z.object({
      name: z.string(),
      age: z.number(),
      active: z.boolean().optional(),
    });

    const processTool = createUserTool(
      'processUser',
      ['name', 'age', 'active'],
      async (name: unknown, age: unknown, active: unknown) => {
        return { name, age, active };
      },
      schema
    );

    vi.mocked(mockLLM.exec).mockResolvedValue({
      newMessages: [
        {
          role: 'assistant',
          content: 'Processed',
        },
      ],
      toolCalls: [],
    });

    const agent = new Agent({
      name: 'Processor',
      llm: mockLLM,
      tools: [processTool],
    });

    await agent.run('Process user data');

    const execCall = vi.mocked(mockLLM.exec).mock.calls[0][0];
    const tool = execCall.tools[0];
    const params = tool.metadata.parameters;

    // Verify all parameter types
    expect(params.properties.name.type).toBe('string');
    expect(params.properties.age.type).toBe('number');
    expect(params.properties.active.type).toBe('boolean');

    // Verify required vs optional
    expect(params.required).toEqual(['name', 'age']);
    // 'active' should not be in required list since it's optional
    expect(params.required).not.toContain('active');
  });
});
