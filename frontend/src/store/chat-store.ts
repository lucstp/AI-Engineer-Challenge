import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { ChatState } from './store.types';

// Chat functionality previously managed through useChat hook
// has been migrated to this centralized store for better state management.
// SECURITY UPDATE: Removed direct API key storage for production security

// Initial state constant to ensure DRY principle and consistency
const INITIAL_STATE: Partial<ChatState> = {
  // Messages state
  messages: [],
  // SECURE API Key state (NO direct storage)
  hasValidApiKey: false,
  apiKeyType: null,
  apiKeyLength: null,
  apiKeyError: null,
  isInitialized: false,
  selectedModel: 'gpt-4.1-mini',
  // UI state
  isLoading: false,
  isTyping: false,
  showTimestamps: false,
  isAnimating: false,
  animatedContent: '',
  isExpanded: false,
};

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, _get) => ({
        ...(INITIAL_STATE as ChatState),

        // Messages actions
        setMessages: (messages) => set({ messages }),
        addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
        updateMessage: (id, updates) =>
          set((state) => ({
            messages: state.messages.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg)),
          })),
        clearMessages: () => set({ messages: [] }),

        // SECURE API Key actions (async - no hydration issues)
        setApiKey: async (key: string) => {
          // Dynamic import to avoid hydration issues
          const { validateAndStoreApiKey } = await import('@/app/actions/api-key-actions');

          set({ isLoading: true, apiKeyError: null });

          try {
            const result = await validateAndStoreApiKey(key);

            if (result.success && result.data) {
              set({
                hasValidApiKey: true,
                apiKeyType: result.data.keyInfo?.type || null,
                apiKeyLength: result.data.keyInfo?.length || null,
                apiKeyError: null,
                isLoading: false,
              });
              return { success: true, error: null };
            }

            set({
              hasValidApiKey: false,
              apiKeyType: null,
              apiKeyLength: null,
              apiKeyError: result.error || 'Validation failed',
              isLoading: false,
            });
            return { success: false, error: result.error || 'Validation failed' };
          } catch (error) {
            const errorMessage = 'Failed to validate API key';
            set({
              hasValidApiKey: false,
              apiKeyType: null,
              apiKeyLength: null,
              apiKeyError: errorMessage,
              isLoading: false,
            });
            return { success: false, error: errorMessage };
          }
        },

        deleteApiKey: async () => {
          // Dynamic import to avoid hydration issues
          const { deleteApiKeySession } = await import('@/app/actions/api-key-actions');

          try {
            await deleteApiKeySession();
            set({
              hasValidApiKey: false,
              apiKeyType: null,
              apiKeyLength: null,
              apiKeyError: null,
              messages: [],
            });
          } catch (error) {
            console.error('Failed to delete API key:', error);
          }
        },

        // FIXED: Safe initialization - no Server Actions during hydration
        initializeStore: () => {
          // Just mark as initialized - session check happens on user interaction
          set({ isInitialized: true });
        },

        // NEW: Separate session check method (called after hydration)
        checkSession: async () => {
          // Dynamic import to avoid hydration issues
          const { getApiKeySession } = await import('@/app/actions/api-key-actions');

          try {
            const session = await getApiKeySession();
            set({
              hasValidApiKey: session?.hasValidKey || false,
              apiKeyType: session?.keyType || null,
              apiKeyLength: session?.keyLength || null,
            });
          } catch (error) {
            console.error('Session check failed:', error);
            set({
              hasValidApiKey: false,
              apiKeyType: null,
              apiKeyLength: null,
            });
          }
        },

        // Other actions
        setSelectedModel: (model) => set({ selectedModel: model }),
        setIsLoading: (loading) => set({ isLoading: loading }),
        setIsTyping: (typing) => set({ isTyping: typing }),
        setShowTimestamps: (show) => set({ showTimestamps: show }),
        setIsAnimating: (animating) => set({ isAnimating: animating }),
        setAnimatedContent: (content) => set({ animatedContent: content }),
        setIsExpanded: (expanded) => set({ isExpanded: expanded }),

        reset: async () => {
          // Dynamic import to avoid hydration issues
          const { deleteApiKeySession } = await import('@/app/actions/api-key-actions');

          try {
            await deleteApiKeySession();
            set(INITIAL_STATE);
          } catch (error) {
            console.error('Store reset failed:', error);
            set(INITIAL_STATE);
          }
        },
      }),
      {
        name: 'chat-storage',
        partialize: (state) => ({
          // Only persist safe UI state - NO API KEYS
          selectedModel: state.selectedModel,
          messages: state.messages,
          isExpanded: state.isExpanded,
          showTimestamps: state.showTimestamps,
        }),
        // FIXED: Safe rehydration - no Server Actions
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Just initialize - don't call Server Actions during hydration
            state.initializeStore();
          }
        },
      },
    ),
  ),
);
