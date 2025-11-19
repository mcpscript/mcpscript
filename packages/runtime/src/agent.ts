// Agent runtime class for MCP Script
import type { BaseLLM } from '@llamaindex/core/llms';
import type { BaseTool } from '@llamaindex/core/llms';
import { Conversation } from './conversation.js';
import { printChatMessage } from './globals.js';
import { wrapToolForAgent } from './mcp.js';

/**
 * Configuration options for creating an agent
 */
export interface AgentConfig {
  /** The name of the agent */
  name: string;
  /** Optional description of the agent's purpose */
  description?: string;
  /** System prompt to guide the agent's behavior */
  systemPrompt?: string;
  /** The LLM to use for this agent */
  llm: BaseLLM;
  /** Tools available to this agent (can be BaseTool, user-defined functions, or arrays of tools) */
  tools?: (
    | BaseTool
    | ((...args: unknown[]) => Promise<unknown>)
    | BaseTool[]
  )[];
}

/**
 * Agent class that encapsulates agent configuration and execution
 * Provides a clean interface for agent delegation without exposing LlamaIndex internals
 */
export class Agent {
  // Marker to identify Agent instances reliably
  readonly __isAgent = true;

  private config: AgentConfig;
  private wrappedTools: BaseTool[];

  constructor(config: AgentConfig) {
    this.config = config;
    // Wrap user-defined tools at runtime
    this.wrappedTools = this.wrapTools(config.tools || []);
  }

  /**
   * Check if a value is a valid BaseTool
   */
  private isBaseTool(value: unknown): value is BaseTool {
    return (
      typeof value === 'object' &&
      value !== null &&
      'metadata' in value &&
      'call' in value &&
      typeof (value as { call: unknown }).call === 'function'
    );
  }

  /**
   * Wrap user-defined tools with metadata attached via Proxy
   * Detects tool type at runtime and wraps accordingly
   */
  private wrapTools(
    tools: (
      | BaseTool
      | ((...args: unknown[]) => Promise<unknown>)
      | BaseTool[]
    )[]
  ): BaseTool[] {
    // Use flatMap to handle arrays (MCP server tool arrays)
    return tools.flatMap(tool => {
      // If it's an array, recursively validate each element
      if (Array.isArray(tool)) {
        // Validate all elements are BaseTools
        for (const item of tool) {
          if (!this.isBaseTool(item)) {
            throw new Error(`"${typeof item}" is not a valid BaseTool.`);
          }
        }
        return tool;
      }

      // Check if it's an MCP server proxy (has __mcp_tools)
      if (
        typeof tool === 'object' &&
        tool !== null &&
        '__mcp_tools' in tool &&
        Array.isArray((tool as { __mcp_tools: unknown }).__mcp_tools)
      ) {
        const mcpTools = (tool as { __mcp_tools: unknown[] }).__mcp_tools;
        // Validate all elements are BaseTools
        for (const item of mcpTools) {
          if (!this.isBaseTool(item)) {
            throw new Error(`"${typeof item}" is not a valid BaseTool.`);
          }
        }
        return mcpTools as BaseTool[];
      }

      // Check if it's a BaseTool using the helper
      if (this.isBaseTool(tool)) {
        return tool;
      }

      // It's a user-defined function - check for metadata from Proxy
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const func = tool as any;
      if (func.__mcps_params && func.__mcps_name) {
        return wrapToolForAgent(func.__mcps_name, func, func.__mcps_params);
      }

      // If no metadata, it might be a regular function passed directly
      throw new Error(`"${func.name || 'anonymous'}" is not a valid tool.`);
    });
  }

  /**
   * Run the agent with a given conversation
   * Handles the full agent loop including tool calls
   * @param conversation - The conversation to continue (can be a string for new conversation)
   * @returns A Conversation object containing the full interaction history
   */
  async run(conversation: Conversation | string): Promise<Conversation> {
    // If string is passed, create a new conversation
    const conv =
      typeof conversation === 'string'
        ? new Conversation(conversation)
        : conversation;
    const messages = conv.getMessages();

    // Add system prompt if configured
    if (this.config.systemPrompt) {
      messages.unshift({
        role: 'system',
        content: this.config.systemPrompt,
      });
    }

    for (const msg of messages) {
      printChatMessage(this.config.name, msg);
    }

    // Agent loop: repeatedly call llm.exec until no more tool calls
    let exit = false;
    do {
      const { newMessages, toolCalls } = await this.config.llm.exec({
        messages,
        tools: this.wrappedTools,
      });
      messages.push(...newMessages);

      for (const msg of newMessages) {
        printChatMessage(this.config.name, msg);
      }

      exit = toolCalls.length === 0;
    } while (!exit);

    // Reconstruct conversation from all messages (excluding system prompt)
    const finalConv = new Conversation();
    for (const msg of messages) {
      if (msg.role !== 'system') {
        finalConv.addMessage(msg);
      }
    }

    return finalConv;
  }

  /**
   * Get the agent's name
   */
  get name(): string {
    return this.config.name;
  }

  /**
   * Get the agent's description
   */
  get description(): string | undefined {
    return this.config.description;
  }
}
