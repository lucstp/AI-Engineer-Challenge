/**
 * Test-specific slice creators for isolated testing
 * These are simplified versions that don't depend on cross-slice communication
 */

import { logger } from '@/lib';

import { createWelcomeMessage } from './chat-slice';
import type {
  AuthSliceCreator,
  ChatSliceCreator,
  SystemSliceCreator,
  UiSliceCreator,
} from './store.types';

/**
 * Chat slice creator for isolated testing
 */
export const createChatTestSlice: ChatSliceCreator = (set, _get) => ({
  // Initial state
  messages: [createWelcomeMessage()],
  selectedModel: 'gpt-4o-mini',

  // Actions
  setMessages: (messages) => {
    logger.debug('🔄 setMessages called', {
      component: 'ChatTestSlice',
      action: 'setMessages',
      messageCount: messages.length,
    });
    set({ messages });
  },

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg)),
    })),

  clearMessages: () => {
    logger.debug('🗑️ clearMessages called', {
      component: 'ChatTestSlice',
      action: 'clearMessages',
    });
    set({ messages: [] });
  },

  setSelectedModel: (model) => set({ selectedModel: model }),
});

/**
 * UI slice creator for isolated testing
 */
export const createUiTestSlice: UiSliceCreator = (set, _get) => ({
  // Initial state
  isLoading: false,
  isTyping: false,
  showTimestamps: false,
  isAnimating: false,
  animatedContent: '',
  isExpanded: false,
  animationMode: 'welcome',
  backgroundMode: 'invalid',
  shouldAnimateExpansion: false,
  hasSeenWelcomeAnimation: false,

  // Actions
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsTyping: (typing) => set({ isTyping: typing }),
  setShowTimestamps: (show) => set({ showTimestamps: show }),
  setIsAnimating: (animating) => set({ isAnimating: animating }),
  setAnimatedContent: (content) => set({ animatedContent: content }),
  setIsExpanded: (expanded) => set({ isExpanded: expanded }),
  setAnimationMode: (mode) => set({ animationMode: mode }),
  setBackgroundMode: (mode) => set({ backgroundMode: mode }),
  setShouldAnimateExpansion: (should) => set({ shouldAnimateExpansion: should }),
  setHasSeenWelcomeAnimation: (seen) => set({ hasSeenWelcomeAnimation: seen }),
  cleanup: () => {}, // No-op for test slice
});

/**
 * Auth slice creator for isolated testing
 */
export const createAuthTestSlice: AuthSliceCreator = (set, _get) => ({
  // Initial state
  hasValidApiKey: false,
  apiKeyType: null,
  apiKeyLength: null,
  apiKeyError: null,
  hasCompletedInitialSetup: false,
  lastSuccessfulKeyType: null,

  // Actions
  setApiKey: async (key: string) => {
    // Simplified version for testing
    set({
      hasValidApiKey: true,
      apiKeyType: 'test-key',
      apiKeyLength: key.length,
      apiKeyError: null,
      hasCompletedInitialSetup: true,
      lastSuccessfulKeyType: 'test-key',
    });
    return { success: true, error: null };
  },

  deleteApiKey: async () => {
    set({
      hasValidApiKey: false,
      apiKeyType: null,
      apiKeyLength: null,
      apiKeyError: null,
    });
  },

  setHasCompletedInitialSetup: (completed) => set({ hasCompletedInitialSetup: completed }),
});

/**
 * System slice creator for isolated testing
 */
export const createSystemTestSlice: SystemSliceCreator = (set, _get) => ({
  // Initial state
  isInitialized: false,
  isRehydrated: true,

  // Actions
  initializeStore: () => {
    set({ isInitialized: true });
  },

  checkSession: async () => {
    // Simplified version for testing
    set({
      isInitialized: true,
    });
  },

  checkWelcomeAnimation: () => {
    // Simplified version for testing
    set({ isInitialized: true });
  },

  setIsRehydrated: (rehydrated) => set({ isRehydrated: rehydrated }),

  reset: async () => {
    set({
      isInitialized: true,
      isRehydrated: true,
    });
  },

  cleanup: () => {}, // No-op for test slice
});
