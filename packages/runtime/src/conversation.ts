// Conversation class for managing agent interactions
import type { ChatMessage, MessageType } from '@llamaindex/core/llms';

/**
 * Conversation represents the full context and state of an LLM interaction
 * Supports agent delegation, multi-turn conversations, and agent handoffs
 */
export class Conversation {
  private messages: ChatMessage[];

  constructor(initialMessage?: string) {
    this.messages = [];
    if (initialMessage) {
      this.messages.push({
        role: 'user' as MessageType,
        content: initialMessage,
      });
    }
  }

  /**
   * Add a message to the conversation
   */
  addMessage(message: ChatMessage): void {
    this.messages.push(message);
  }

  /**
   * Get all messages in the conversation
   */
  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  /**
   * Get the result of the conversation (last assistant message)
   */
  result(): string {
    // Find the last assistant message
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].role === 'assistant') {
        const content = this.messages[i].content;
        return typeof content === 'string' ? content : '';
      }
    }
    return '';
  }
}
