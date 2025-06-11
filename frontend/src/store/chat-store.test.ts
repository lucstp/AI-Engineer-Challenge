import { beforeEach, describe, expect, it } from 'vitest';

import { useChatStore, type Message } from './index';

// Helper to reset Zustand store state between tests using public API
const resetStore = () => {
  useChatStore.getState().reset();
};

// Clearly fake/mock API keys for testing (51 chars total, 48 after prefix sk-)
const validKey = 'sk-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'; // 48 a's after sk-
const anotherValidKey = 'sk-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'; // 48 b's after sk-
// Realistic format: mixed case and digits, still fake
const realisticKey = 'sk-aA1bB2cC3dD4eE5fF6gG7hH8iI9jJ0kK1lL2mM3nN4oO5pQr'; // 48 chars after sk-
const wrongLengthKey = 'sk-shortkey123'; // too short
const invalidCharKey = 'sk-abc$%^defghijklmnopqrstuvwxyz1234567890ABCDEFghij'; // contains symbols
const uppercaseOnlyKey = 'sk-ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKL'; // 48 uppercase after sk-

describe('chat-store Zustand store', () => {
  beforeEach(() => {
    resetStore();
    // Clear localStorage mocks
    localStorage.clear();
  });

  describe('messages state', () => {
    it('sets messages', () => {
      const messages: Message[] = [{ id: '1', content: 'hi', role: 'user', timestamp: 't1' }];
      useChatStore.getState().setMessages(messages);
      expect(useChatStore.getState().messages).toEqual(messages);
    });

    it('adds a message', () => {
      const msg: Message = { id: '2', content: 'hello', role: 'assistant', timestamp: 't2' };
      useChatStore.getState().addMessage(msg);
      expect(useChatStore.getState().messages).toContainEqual(msg);
    });

    it('clears messages', () => {
      useChatStore
        .getState()
        .setMessages([{ id: '1', content: 'hi', role: 'user', timestamp: 't1' }]);
      useChatStore.getState().clearMessages();
      expect(useChatStore.getState().messages).toEqual([]);
    });
  });

  describe('API key state', () => {
    it('sets and validates a valid API key', () => {
      useChatStore.getState().setApiKey(validKey);
      expect(useChatStore.getState().apiKey).toBe(validKey);
      expect(useChatStore.getState().isApiKeyValid).toBe(true);
      expect(useChatStore.getState().apiKeyError).toBeNull();
    });

    it('sets and validates a realistic format API key', () => {
      useChatStore.getState().setApiKey(realisticKey);
      expect(useChatStore.getState().apiKey).toBe(realisticKey);
      expect(useChatStore.getState().isApiKeyValid).toBe(true);
      expect(useChatStore.getState().apiKeyError).toBeNull();
    });

    it('rejects a key with correct prefix but wrong length', () => {
      useChatStore.getState().setApiKey(wrongLengthKey);
      expect(useChatStore.getState().apiKey).toBe(wrongLengthKey);
      expect(useChatStore.getState().isApiKeyValid).toBe(false);
      expect(useChatStore.getState().apiKeyError).toBeDefined();
    });

    it('rejects a key with invalid characters', () => {
      useChatStore.getState().setApiKey(invalidCharKey);
      expect(useChatStore.getState().apiKey).toBe(invalidCharKey);
      expect(useChatStore.getState().isApiKeyValid).toBe(false);
      expect(useChatStore.getState().apiKeyError).toBeDefined();
    });

    it('accepts an uppercase-only API key (current regex allows it)', () => {
      useChatStore.getState().setApiKey(uppercaseOnlyKey);
      expect(useChatStore.getState().apiKey).toBe(uppercaseOnlyKey);
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
    it('persists apiKey, selectedModel, messages, isExpanded', async () => {
      useChatStore.getState().setApiKey(anotherValidKey);
      useChatStore.getState().setSelectedModel('gpt-4.2');
      useChatStore
        .getState()
        .setMessages([{ id: '1', content: 'hi', role: 'user', timestamp: 't1' }]);
      useChatStore.getState().setIsExpanded(true);

      // Give the persistence middleware time to write to localStorage
      await new Promise((resolve) => setTimeout(resolve, 10));

      const persisted = JSON.parse(localStorage.getItem('chat-storage') || '{}');
      expect(persisted.state.apiKey).toBe(anotherValidKey);
      expect(persisted.state.selectedModel).toBe('gpt-4.2');
      expect(persisted.state.messages).toHaveLength(1);
      expect(persisted.state.isExpanded).toBe(true);
    });
  });
});
