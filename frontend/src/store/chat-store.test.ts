import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useChatStore, type Message } from './chat-store';

// Helper to reset Zustand store state between tests
const resetStore = () => {
  useChatStore.setState(useChatStore.getInitialState());
};

describe('chat-store Zustand store', () => {
  beforeEach(() => {
    resetStore();
    // Clear localStorage mocks
    localStorage.clear();
  });

  describe('messages state', () => {
    it('sets messages', () => {
      const messages: Message[] = [
        { id: '1', content: 'hi', role: 'user', timestamp: 't1' },
      ];
      useChatStore.getState().setMessages(messages);
      expect(useChatStore.getState().messages).toEqual(messages);
    });

    it('adds a message', () => {
      const msg: Message = { id: '2', content: 'hello', role: 'assistant', timestamp: 't2' };
      useChatStore.getState().addMessage(msg);
      expect(useChatStore.getState().messages).toContainEqual(msg);
    });

    it('clears messages', () => {
      useChatStore.getState().setMessages([
        { id: '1', content: 'hi', role: 'user', timestamp: 't1' },
      ]);
      useChatStore.getState().clearMessages();
      expect(useChatStore.getState().messages).toEqual([]);
    });
  });

  describe('API key state', () => {
    it('sets and validates a valid API key', () => {
      const validKey = 'sk-abcdefghijklmnopqrstuvwxyz12345';
      useChatStore.getState().setApiKey(validKey);
      expect(useChatStore.getState().apiKey).toBe(validKey);
      expect(useChatStore.getState().isApiKeyValid).toBe(true);
      expect(useChatStore.getState().apiKeyError).toBeNull();
    });

    it('sets and validates an invalid API key', () => {
      const invalidKey = 'invalid-key';
      useChatStore.getState().setApiKey(invalidKey);
      expect(useChatStore.getState().apiKey).toBe(invalidKey);
      expect(useChatStore.getState().isApiKeyValid).toBe(false);
      expect(useChatStore.getState().apiKeyError).toBeDefined();
    });

    it('deletes API key and clears related state', () => {
      const validKey = 'sk-abcdefghijklmnopqrstuvwxyz12345';
      useChatStore.getState().setApiKey(validKey);
      useChatStore.getState().deleteApiKey();
      expect(useChatStore.getState().apiKey).toBe('');
      expect(useChatStore.getState().isApiKeyValid).toBe(false);
      expect(useChatStore.getState().apiKeyError).toBeNull();
      expect(useChatStore.getState().messages).toEqual([]);
    });

    it('validateApiKey sets error for invalid key', () => {
      useChatStore.getState().validateApiKey('bad');
      expect(useChatStore.getState().isApiKeyValid).toBe(false);
      expect(useChatStore.getState().apiKeyError).toBeDefined();
    });
  });

  describe('initialization', () => {
    it('initializes and validates API key if present', () => {
      const validKey = 'sk-abcdefghijklmnopqrstuvwxyz12345';
      useChatStore.getState().setApiKey(validKey);
      useChatStore.setState({ isApiKeyValid: false });
      useChatStore.getState().initializeStore();
      expect(useChatStore.getState().isInitialized).toBe(true);
      expect(useChatStore.getState().isApiKeyValid).toBe(true);
    });

    it('initializes without API key', () => {
      useChatStore.getState().initializeStore();
      expect(useChatStore.getState().isInitialized).toBe(true);
    });
  });

  describe('model state', () => {
    it('sets selected model', () => {
      useChatStore.getState().setSelectedModel('gpt-4.2');
      expect(useChatStore.getState().selectedModel).toBe('gpt-4.2');
    });
  });

  describe('UI state', () => {
    it('sets isLoading', () => {
      useChatStore.getState().setIsLoading(true);
      expect(useChatStore.getState().isLoading).toBe(true);
    });
    it('sets isTyping', () => {
      useChatStore.getState().setIsTyping(true);
      expect(useChatStore.getState().isTyping).toBe(true);
    });
    it('sets showTimestamps', () => {
      useChatStore.getState().setShowTimestamps(true);
      expect(useChatStore.getState().showTimestamps).toBe(true);
    });
    it('sets isAnimating', () => {
      useChatStore.getState().setIsAnimating(true);
      expect(useChatStore.getState().isAnimating).toBe(true);
    });
    it('sets animatedContent', () => {
      useChatStore.getState().setAnimatedContent('anim');
      expect(useChatStore.getState().animatedContent).toBe('anim');
    });
    it('sets isExpanded', () => {
      useChatStore.getState().setIsExpanded(true);
      expect(useChatStore.getState().isExpanded).toBe(true);
    });
  });

  describe('persistence', () => {
    it('persists apiKey, selectedModel, messages, isExpanded', () => {
      useChatStore.getState().setApiKey('sk-abcdefghijklmnopqrstuvwxyz12345');
      useChatStore.getState().setSelectedModel('gpt-4.2');
      useChatStore.getState().setMessages([
        { id: '1', content: 'hi', role: 'user', timestamp: 't1' },
      ]);
      useChatStore.getState().setIsExpanded(true);
      const persisted = JSON.parse(localStorage.getItem('chat-storage') || '{}');
      expect(persisted.state.apiKey).toBe('sk-abcdefghijklmnopqrstuvwxyz12345');
      expect(persisted.state.selectedModel).toBe('gpt-4.2');
      expect(persisted.state.messages).toHaveLength(1);
      expect(persisted.state.isExpanded).toBe(true);
    });
  });
});
