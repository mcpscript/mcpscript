// Agent runtime class for MCP Script
import type { BaseLLM } from '@llamaindex/core/llms';
import type { BaseTool } from '@llamaindex/core/llms';
import { Conversation } from './conversation.js';
import { printChatMessage } from './globals.js';

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
  /** Tools available to this agent */
  tools?: BaseTool[];
}

/**
 * Agent class that encapsulates agent configuration and execution
 * Provides a clean interface for agent delegation without exposing LlamaIndex internals
 */
export class Agent {
  private config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
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
        tools: this.config.tools || [],
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
