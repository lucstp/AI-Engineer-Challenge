import {
  deleteApiKeySession,
  getApiKeySession,
  validateAndStoreApiKey,
} from '@/app/actions/api-key-actions';
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
  // Initialization state
  isInitialized: false,
  // Model state
  selectedModel: 'gpt-4o-mini',
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

        // SECURE API Key actions (no client storage)
        setApiKey: async (key: string): Promise<boolean> => {
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
              return true; // Success
            }

            set({
              hasValidApiKey: false,
              apiKeyType: null,
              apiKeyLength: null,
              apiKeyError: result.error || 'Validation failed',
              isLoading: false,
            });
            return false; // Validation failed
          } catch (error) {
            set({
              hasValidApiKey: false,
              apiKeyType: null,
              apiKeyLength: null,
              apiKeyError: 'Failed to validate API key',
              isLoading: false,
            });
            return false; // Exception occurred
          }
        },

        deleteApiKey: async () => {
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

        // Check session on initialization
        initializeStore: async () => {
          try {
            const session = await getApiKeySession();
            set({
              hasValidApiKey: session?.hasValidKey || false,
              apiKeyType: session?.keyType || null,
              apiKeyLength: session?.keyLength || null,
              isInitialized: true,
            });
          } catch (error) {
            console.error('Store initialization failed:', error);
            set({ isInitialized: true });
          }
        },

        // Model actions
        setSelectedModel: (model) => set({ selectedModel: model }),

        // UI state actions
        setIsLoading: (loading) => set({ isLoading: loading }),
        setIsTyping: (typing) => set({ isTyping: typing }),
        setShowTimestamps: (show) =>
          set((state) => ({
            showTimestamps: typeof show === 'function' ? show(state.showTimestamps) : show,
          })),
        setIsAnimating: (animating) => set({ isAnimating: animating }),
        setAnimatedContent: (content) => set({ animatedContent: content }),
        setIsExpanded: (expanded) => set({ isExpanded: expanded }),

        // Testing utilities - public reset method for test usage
        reset: async () => {
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
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Validate the API key when the store is rehydrated
            state.initializeStore();
          }
        },
      },
    ),
  ),
);
