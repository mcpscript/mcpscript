import { describe, it, expect } from 'vitest';
import { Conversation } from '../conversation.js';

describe('Conversation', () => {
  describe('constructor', () => {
    it('should create an empty conversation', () => {
      const conv = new Conversation();
      expect(conv.getMessages()).toEqual([]);
    });

    it('should create a conversation with an initial message', () => {
      const conv = new Conversation('Hello');
      const messages = conv.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual({
        role: 'user',
        content: 'Hello',
      });
    });
  });

  describe('addUserMessage', () => {
    it('should add a user message to an empty conversation', () => {
      const conv = new Conversation();
      conv.addUserMessage('Hello');
      const messages = conv.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual({
        role: 'user',
        content: 'Hello',
      });
    });

    it('should append to the last user message if it is also a user message', () => {
      const conv = new Conversation('Hello');
      conv.addUserMessage('World');
      const messages = conv.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual({
        role: 'user',
        content: 'Hello\nWorld',
      });
    });

    it('should create a new message if the last message is not from a user', () => {
      const conv = new Conversation();
      conv.addMessage({ role: 'assistant', content: 'Hi there!' });
      conv.addUserMessage('How are you?');
      const messages = conv.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages[0]).toEqual({
        role: 'assistant',
        content: 'Hi there!',
      });
      expect(messages[1]).toEqual({
        role: 'user',
        content: 'How are you?',
      });
    });

    it('should append multiple consecutive user messages', () => {
      const conv = new Conversation('First');
      conv.addUserMessage('Second');
      conv.addUserMessage('Third');
      const messages = conv.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual({
        role: 'user',
        content: 'First\nSecond\nThird',
      });
    });

    it('should not add extra newline if previous message ends with newline', () => {
      const conv = new Conversation('First\n');
      conv.addUserMessage('Second');
      const messages = conv.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual({
        role: 'user',
        content: 'First\nSecond',
      });
    });

    it('should support chaining', () => {
      const conv = new Conversation();
      const result = conv.addUserMessage('Hello');
      expect(result).toBe(conv);
    });
  });

  describe('addMessage', () => {
    it('should add a non-user message to the conversation', () => {
      const conv = new Conversation();
      conv.addMessage({ role: 'assistant', content: 'Hello' });
      const messages = conv.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual({
        role: 'assistant',
        content: 'Hello',
      });
    });

    it('should append user message to last user message', () => {
      const conv = new Conversation('First message');
      conv.addMessage({ role: 'user', content: 'Second message' });
      const messages = conv.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual({
        role: 'user',
        content: 'First message\nSecond message',
      });
    });

    it('should create new user message if last message is not from user', () => {
      const conv = new Conversation();
      conv.addMessage({ role: 'assistant', content: 'Hi' });
      conv.addMessage({ role: 'user', content: 'Hello' });
      const messages = conv.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages[0]).toEqual({
        role: 'assistant',
        content: 'Hi',
      });
      expect(messages[1]).toEqual({
        role: 'user',
        content: 'Hello',
      });
    });

    it('should not merge non-user messages', () => {
      const conv = new Conversation();
      conv.addMessage({ role: 'assistant', content: 'First' });
      conv.addMessage({ role: 'assistant', content: 'Second' });
      const messages = conv.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages[0]).toEqual({
        role: 'assistant',
        content: 'First',
      });
      expect(messages[1]).toEqual({
        role: 'assistant',
        content: 'Second',
      });
    });

    it('should not add extra newline if previous user message ends with newline', () => {
      const conv = new Conversation('First\n');
      conv.addMessage({ role: 'user', content: 'Second' });
      const messages = conv.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual({
        role: 'user',
        content: 'First\nSecond',
      });
    });

    it('should support chaining', () => {
      const conv = new Conversation();
      const result = conv.addMessage({ role: 'user', content: 'Hello' });
      expect(result).toBe(conv);
    });
  });

  describe('result', () => {
    it('should return empty string for conversation with no assistant messages', () => {
      const conv = new Conversation('Hello');
      expect(conv.result()).toBe('');
    });

    it('should return the last assistant message', () => {
      const conv = new Conversation('Hello');
      conv.addMessage({ role: 'assistant', content: 'Hi there!' });
      expect(conv.result()).toBe('Hi there!');
    });

    it('should return the last assistant message even with later user messages', () => {
      const conv = new Conversation('Hello');
      conv.addMessage({ role: 'assistant', content: 'Hi there!' });
      conv.addUserMessage('How are you?');
      expect(conv.result()).toBe('Hi there!');
    });
  });
});
