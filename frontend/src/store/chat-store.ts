import { apiKeySchema } from '@/lib/validation';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { ChatState } from './store.types';

// Chat functionality previously managed through useChat hook
// has been migrated to this centralized store for better state management.

// Initial state constant to ensure DRY principle and consistency
const INITIAL_STATE: Partial<ChatState> = {
  // Messages state
  messages: [],
  // API Key state
  apiKey: '',
  isApiKeyValid: false,
  apiKeyError: null,
  // Initialization state
  isInitialized: false,
  // Model state
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
      (set, get) => ({
        ...(INITIAL_STATE as ChatState),

        // Messages actions
        setMessages: (messages) => set({ messages }),
        addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
        clearMessages: () => set({ messages: [] }),

        // API Key actions
        setApiKey: (key) => {
          set({ apiKey: key });
          get().validateApiKey(key);
        },
        deleteApiKey: () => {
          set({
            apiKey: '',
            apiKeyError: null,
            isApiKeyValid: false,
            messages: [],
          });
          // Clear from localStorage to ensure it's gone
          localStorage.removeItem('OPENAI_API_KEY');
        },
        validateApiKey: (key) => {
          const validation = apiKeySchema.safeParse(key.trim());
          set({
            isApiKeyValid: validation.success,
            apiKeyError: validation.success ? null : validation.error.issues[0]?.message,
          });
        },

        // Initialization actions
        initializeStore: () => {
          // This ensures we validate the API key on app initialization
          const currentKey = get().apiKey;
          if (currentKey) {
            get().validateApiKey(currentKey);
          }
          set({ isInitialized: true });
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
        reset: () => {
          // Clear localStorage to ensure complete reset
          localStorage.removeItem('OPENAI_API_KEY');
          localStorage.removeItem('chat-storage');
          // Reset to initial state
          set(INITIAL_STATE);
        },
      }),
      {
        name: 'chat-storage',
        partialize: (state) => ({
          apiKey: state.apiKey,
          selectedModel: state.selectedModel,
          messages: state.messages,
          isExpanded: state.isExpanded,
        }),
        // This runs after hydration from localStorage
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
