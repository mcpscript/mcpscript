// Tests for Agent runtime class
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Agent } from '../agent.js';
import { Conversation } from '../conversation.js';
import type { BaseLLM, ToolCall } from '@llamaindex/core/llms';
import type { BaseTool } from '@llamaindex/core/llms';

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
});
