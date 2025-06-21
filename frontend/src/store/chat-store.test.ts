import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createAuthTestStore,
  createChatTestStore,
  createSystemTestStore,
  createTestStore,
  createUiTestStore,
  type Message,
} from './index';

// Mock the server actions
vi.mock('@/app/actions/api-key-actions', () => ({
  validateAndStoreApiKey: vi.fn(),
  getApiKeySession: vi.fn(),
  deleteApiKeySession: vi.fn(),
}));

// Clearly fake/mock API keys for testing (51 chars total, 48 after prefix sk-)
const validKey = 'sk-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'; // 48 a's after sk-
const anotherValidKey = 'sk-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'; // 48 b's after sk-
// Realistic format: mixed case and digits, still fake
const realisticKey = 'sk-aA1bB2cC3dD4eE5fF6gG7hH8iI9jJ0kK1lL2mM3nN4oO5pQr'; // 48 chars after sk-
const wrongLengthKey = 'sk-shortkey123'; // too short
const invalidCharKey = 'sk-abc$%^defghijklmnopqrstuvwxyz1234567890ABCDEFghij'; // contains symbols
const uppercaseOnlyKey = 'sk-ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKL'; // 48 uppercase after sk-

describe('chat-store Zustand slice-based architecture', () => {
  beforeEach(() => {
    // Clear localStorage mocks
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('ChatSlice: messages state', () => {
    it('sets messages', () => {
      const store = createChatTestStore();
      const messages: Message[] = [{ id: '1', content: 'hi', role: 'user', timestamp: 't1' }];

      store.getState().setMessages(messages);
      expect(store.getState().messages).toEqual(messages);
    });

    it('adds a message', () => {
      const store = createChatTestStore();
      const msg: Message = { id: '2', content: 'hello', role: 'assistant', timestamp: 't2' };

      store.getState().addMessage(msg);
      expect(store.getState().messages).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: '2', content: 'hello' })]),
      );
    });

    it('updates a message', () => {
      const store = createChatTestStore();
      const initialMsg: Message = { id: '1', content: 'hi', role: 'user', timestamp: 't1' };

      store.getState().setMessages([initialMsg]);
      store.getState().updateMessage('1', { content: 'updated content' });

      expect(store.getState().messages).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: '1', content: 'updated content' })]),
      );
    });

    it('clears messages', () => {
      const store = createChatTestStore();
      store.getState().setMessages([{ id: '1', content: 'hi', role: 'user', timestamp: 't1' }]);

      store.getState().clearMessages();
      expect(store.getState().messages).toEqual([]);
    });

    it('sets selected model', () => {
      const store = createChatTestStore();

      store.getState().setSelectedModel('gpt-4');
      expect(store.getState().selectedModel).toBe('gpt-4');
    });
  });

  describe('AuthSlice: API key management', () => {
    it('sets and validates a valid API key', async () => {
      const store = createAuthTestStore();

      const result = await store.getState().setApiKey(validKey);

      expect(result.success).toBe(true);
      expect(store.getState().hasValidApiKey).toBe(true);
      expect(store.getState().apiKeyType).toBe('test-key');
      expect(store.getState().apiKeyLength).toBe(validKey.length);
      expect(store.getState().apiKeyError).toBeNull();
    });

    it('deletes API key and clears related state', async () => {
      const store = createAuthTestStore();

      // First set a valid key
      await store.getState().setApiKey(validKey);
      expect(store.getState().hasValidApiKey).toBe(true);

      // Then delete it
      await store.getState().deleteApiKey();
      expect(store.getState().hasValidApiKey).toBe(false);
      expect(store.getState().apiKeyType).toBeNull();
      expect(store.getState().apiKeyLength).toBeNull();
      expect(store.getState().apiKeyError).toBeNull();
    });

    it('manages setup completion state', () => {
      const store = createAuthTestStore();

      store.getState().setHasCompletedInitialSetup(true);
      expect(store.getState().hasCompletedInitialSetup).toBe(true);
    });
  });

  describe('UiSlice: UI state management', () => {
    it('sets isLoading', () => {
      const store = createUiTestStore();

      store.getState().setIsLoading(true);
      expect(store.getState().isLoading).toBe(true);
    });

    it('sets isTyping', () => {
      const store = createUiTestStore();

      store.getState().setIsTyping(true);
      expect(store.getState().isTyping).toBe(true);
    });

    it('sets showTimestamps', () => {
      const store = createUiTestStore();

      store.getState().setShowTimestamps(true);
      expect(store.getState().showTimestamps).toBe(true);
    });

    it('sets isAnimating', () => {
      const store = createUiTestStore();

      store.getState().setIsAnimating(true);
      expect(store.getState().isAnimating).toBe(true);
    });

    it('sets animatedContent', () => {
      const store = createUiTestStore();

      store.getState().setAnimatedContent('test animation');
      expect(store.getState().animatedContent).toBe('test animation');
    });

    it('sets isExpanded', () => {
      const store = createUiTestStore();

      store.getState().setIsExpanded(true);
      expect(store.getState().isExpanded).toBe(true);
    });

    it('manages animation modes', () => {
      const store = createUiTestStore();

      store.getState().setAnimationMode('expanded');
      expect(store.getState().animationMode).toBe('expanded');

      store.getState().setBackgroundMode('valid');
      expect(store.getState().backgroundMode).toBe('valid');
    });

    it('manages welcome animation state', () => {
      const store = createUiTestStore();

      store.getState().setHasSeenWelcomeAnimation(true);
      expect(store.getState().hasSeenWelcomeAnimation).toBe(true);
    });
  });

  describe('SystemSlice: initialization and session', () => {
    it('initializes store', () => {
      const store = createSystemTestStore();

      store.getState().initializeStore();
      expect(store.getState().isInitialized).toBe(true);
    });

    it('checks session', async () => {
      const store = createSystemTestStore();

      await store.getState().checkSession();
      expect(store.getState().isInitialized).toBe(true);
    });

    it('sets rehydration state', () => {
      const store = createSystemTestStore();

      store.getState().setIsRehydrated(false);
      expect(store.getState().isRehydrated).toBe(false);
    });

    it('resets state', async () => {
      const store = createSystemTestStore();

      await store.getState().reset();
      expect(store.getState().isInitialized).toBe(true);
      expect(store.getState().isRehydrated).toBe(true);
    });
  });

  describe('Combined Store: slice integration', () => {
    it('combines all slices correctly', () => {
      const store = createTestStore();

      // Test that all slice methods are available
      expect(typeof store.getState().setMessages).toBe('function');
      expect(typeof store.getState().setIsLoading).toBe('function');
      expect(typeof store.getState().setApiKey).toBe('function');
      expect(typeof store.getState().initializeStore).toBe('function');
    });

    it('maintains slice independence', () => {
      const store = createTestStore();

      // Test that slices work independently
      store.getState().setSelectedModel('gpt-4');
      store.getState().setIsLoading(true);
      store.getState().setHasCompletedInitialSetup(true);

      expect(store.getState().selectedModel).toBe('gpt-4');
      expect(store.getState().isLoading).toBe(true);
      expect(store.getState().hasCompletedInitialSetup).toBe(true);
    });
  });

  describe('Slice architecture benefits', () => {
    it('allows isolated testing of chat functionality', () => {
      const chatStore = createChatTestStore();

      // Test chat functionality in isolation
      chatStore.getState().setSelectedModel('gpt-4');
      chatStore.getState().addMessage({ id: '1', content: 'test', role: 'user', timestamp: 'now' });

      expect(chatStore.getState().selectedModel).toBe('gpt-4');
      expect(chatStore.getState().messages).toHaveLength(2); // welcome + test message
    });

    it('allows isolated testing of UI functionality', () => {
      const uiStore = createUiTestStore();

      // Test UI functionality in isolation
      uiStore.getState().setIsLoading(true);
      uiStore.getState().setAnimationMode('expanded');

      expect(uiStore.getState().isLoading).toBe(true);
      expect(uiStore.getState().animationMode).toBe('expanded');
    });

    it('allows isolated testing of auth functionality', async () => {
      const authStore = createAuthTestStore();

      // Test auth functionality in isolation
      const result = await authStore.getState().setApiKey('test-key');

      expect(result.success).toBe(true);
      expect(authStore.getState().hasValidApiKey).toBe(true);
    });
  });
});
