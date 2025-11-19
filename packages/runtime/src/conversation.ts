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
   * Add a user message to the conversation (convenience method)
   * Returns this for chaining
   */
  addUserMessage(content: string): Conversation {
    this.messages.push({
      role: 'user' as MessageType,
      content: content,
    });
    return this;
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

/**
 * Pipe operator runtime implementation
 * Handles dynamic type checking for conversation chaining
 *
 * Cases:
 * - string | Agent -> create conversation and run agent
 * - Conversation | string -> append user message to conversation
 * - Conversation | Agent -> run agent with conversation
 */
export async function pipe(
  left: string | Conversation | Promise<Conversation>,
  right:
    | string
    | { run: (input: string | Conversation) => Promise<Conversation> }
    | Promise<
        | string
        | { run: (input: string | Conversation) => Promise<Conversation> }
      >
): Promise<Conversation> {
  // Await if left is a promise
  const leftValue = left instanceof Promise ? await left : left;

  // Await if right is a promise
  const rightValue = right instanceof Promise ? await right : right;

  // Check if right is an Agent using the __isAgent marker
  // This avoids circular dependency issues while being explicit and reliable
  const isAgent =
    typeof rightValue === 'object' &&
    rightValue !== null &&
    '__isAgent' in rightValue &&
    rightValue.__isAgent === true;

  if (isAgent) {
    // left | Agent -> run agent with left as input
    return await rightValue.run(leftValue);
  } else if (typeof rightValue === 'string') {
    // left | string -> append message to conversation
    if (!(leftValue instanceof Conversation)) {
      throw new Error(
        'Pipe operator: Cannot append message to non-conversation. ' +
          'Left side must be a Conversation when piping a string.'
      );
    }
    return leftValue.addUserMessage(rightValue);
  } else {
    throw new Error(
      'Pipe operator: Invalid right operand. Expected Agent or string.'
    );
  }
}
