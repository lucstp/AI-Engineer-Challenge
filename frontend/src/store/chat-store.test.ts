import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useChatStore, type Message } from './index';

// Mock the server actions
vi.mock('@/app/actions/api-key-actions', () => ({
  validateAndStoreApiKey: vi.fn(),
  getApiKeySession: vi.fn(),
  deleteApiKeySession: vi.fn(),
}));

// Helper to reset Zustand store state between tests using public API
const resetStore = async () => {
  await useChatStore.getState().reset();
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
  beforeEach(async () => {
    await resetStore();
    // Clear localStorage mocks
    localStorage.clear();
    vi.clearAllMocks();
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

  describe('API key state (secure)', () => {
    it('sets and validates a valid API key', async () => {
      const { validateAndStoreApiKey } = await import('@/app/actions/api-key-actions');
      vi.mocked(validateAndStoreApiKey).mockResolvedValue({
        success: true,
        data: {
          success: true,
          keyInfo: { type: 'project', length: 51 },
        },
      });

      await useChatStore.getState().setApiKey(validKey);
      expect(useChatStore.getState().hasValidApiKey).toBe(true);
      expect(useChatStore.getState().apiKeyType).toBe('project');
      expect(useChatStore.getState().apiKeyLength).toBe(51);
      expect(useChatStore.getState().apiKeyError).toBeNull();
    });

    it('rejects an invalid API key', async () => {
      const { validateAndStoreApiKey } = await import('@/app/actions/api-key-actions');
      vi.mocked(validateAndStoreApiKey).mockResolvedValue({
        success: false,
        error: 'Invalid API key format',
        fieldErrors: { apiKey: ['Invalid OpenAI API key format'] },
      });

      await useChatStore.getState().setApiKey('invalid-key');
      expect(useChatStore.getState().hasValidApiKey).toBe(false);
      expect(useChatStore.getState().apiKeyType).toBeNull();
      expect(useChatStore.getState().apiKeyLength).toBeNull();
      expect(useChatStore.getState().apiKeyError).toBe('Invalid API key format');
    });

    it('deletes API key and clears related state', async () => {
      const { deleteApiKeySession } = await import('@/app/actions/api-key-actions');
      vi.mocked(deleteApiKeySession).mockResolvedValue();

      // First set a valid key
      const { validateAndStoreApiKey } = await import('@/app/actions/api-key-actions');
      vi.mocked(validateAndStoreApiKey).mockResolvedValue({
        success: true,
        data: {
          success: true,
          keyInfo: { type: 'project', length: 51 },
        },
      });
      await useChatStore.getState().setApiKey(validKey);

      // Then delete it
      await useChatStore.getState().deleteApiKey();
      expect(useChatStore.getState().hasValidApiKey).toBe(false);
      expect(useChatStore.getState().apiKeyType).toBeNull();
      expect(useChatStore.getState().apiKeyLength).toBeNull();
      expect(useChatStore.getState().apiKeyError).toBeNull();
      expect(useChatStore.getState().messages).toEqual([]);
    });

    it('handles server action errors gracefully', async () => {
      const { validateAndStoreApiKey } = await import('@/app/actions/api-key-actions');
      vi.mocked(validateAndStoreApiKey).mockRejectedValue(new Error('Network error'));

      await useChatStore.getState().setApiKey(validKey);
      expect(useChatStore.getState().hasValidApiKey).toBe(false);
      expect(useChatStore.getState().apiKeyError).toBe('Failed to validate API key');
    });
  });

  describe('initialization', () => {
    it('initializes with valid session', async () => {
      const { getApiKeySession } = await import('@/app/actions/api-key-actions');
      vi.mocked(getApiKeySession).mockResolvedValue({
        hasValidKey: true,
        keyType: 'project',
        keyLength: 51,
        expiresAt: Date.now() + 86400000,
      });

      // Initialize store (synchronous)
      useChatStore.getState().initializeStore();
      expect(useChatStore.getState().isInitialized).toBe(true);

      // Then check session (asynchronous)
      await useChatStore.getState().checkSession();
      expect(useChatStore.getState().hasValidApiKey).toBe(true);
      expect(useChatStore.getState().apiKeyType).toBe('project');
    });

    it('initializes without valid session', async () => {
      const { getApiKeySession } = await import('@/app/actions/api-key-actions');
      vi.mocked(getApiKeySession).mockResolvedValue(null);

      // Initialize store (synchronous)
      useChatStore.getState().initializeStore();
      expect(useChatStore.getState().isInitialized).toBe(true);

      // Then check session (asynchronous)
      await useChatStore.getState().checkSession();
      expect(useChatStore.getState().hasValidApiKey).toBe(false);
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
    it('persists only safe data (no API keys)', async () => {
      useChatStore.getState().setSelectedModel('gpt-4.2');
      useChatStore
        .getState()
        .setMessages([{ id: '1', content: 'hi', role: 'user', timestamp: 't1' }]);
      useChatStore.getState().setIsExpanded(true);

      // Give the persistence middleware time to write to localStorage
      await new Promise((resolve) => setTimeout(resolve, 10));

      const persisted = JSON.parse(localStorage.getItem('chat-storage') || '{}');
      expect(persisted.state.selectedModel).toBe('gpt-4.2');
      expect(persisted.state.messages).toHaveLength(1);
      expect(persisted.state.isExpanded).toBe(true);
      // Ensure API key data is NOT persisted for security
      expect(persisted.state.hasValidApiKey).toBeUndefined();
      expect(persisted.state.apiKeyType).toBeUndefined();
      expect(persisted.state.apiKeyLength).toBeUndefined();
    });
  });
});
