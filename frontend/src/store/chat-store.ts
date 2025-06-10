import { z } from 'zod';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Chat functionality previously managed through useChat hook
// has been migrated to this centralized store for better state management.

const apiKeySchema = z
  .string()
  .min(31, 'API key must be at least 31 characters long')
  .regex(/^sk-[\w-]+$/, 'API key must start with "sk-" and be valid');

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  animated?: boolean;
  showTimestamp?: boolean;
}

interface ChatState {
  // Messages state
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;

  // API Key state
  apiKey: string;
  setApiKey: (key: string) => void;
  deleteApiKey: () => void;
  isApiKeyValid: boolean;
  apiKeyError: string | null;
  validateApiKey: (key: string) => void;

  // Initialization
  isInitialized: boolean;
  initializeStore: () => void;

  // Model state
  selectedModel: string;
  setSelectedModel: (model: string) => void;

  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  showTimestamps: boolean;
  setShowTimestamps: (show: boolean) => void;
  isAnimating: boolean;
  setIsAnimating: (animating: boolean) => void;
  animatedContent: string;
  setAnimatedContent: (content: string) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        // Messages state
        messages: [],
        setMessages: (messages) => set({ messages }),
        addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
        clearMessages: () => set({ messages: [] }),

        // API Key state
        apiKey: '',
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
        isApiKeyValid: false,
        apiKeyError: null,
        validateApiKey: (key) => {
          const validation = apiKeySchema.safeParse(key.trim());
          set({
            isApiKeyValid: validation.success,
            apiKeyError: validation.success ? null : validation.error.issues[0]?.message,
          });
        },

        // Initialization state
        isInitialized: false,
        initializeStore: () => {
          // This ensures we validate the API key on app initialization
          const currentKey = get().apiKey;
          if (currentKey) {
            get().validateApiKey(currentKey);
          }
          set({ isInitialized: true });
        },

        // Model state
        selectedModel: 'gpt-4.1-mini',
        setSelectedModel: (model) => set({ selectedModel: model }),

        // UI state
        isLoading: false,
        setIsLoading: (loading) => set({ isLoading: loading }),
        isTyping: false,
        setIsTyping: (typing) => set({ isTyping: typing }),
        showTimestamps: false,
        setShowTimestamps: (show) => set({ showTimestamps: show }),
        isAnimating: false,
        setIsAnimating: (animating) => set({ isAnimating: animating }),
        animatedContent: '',
        setAnimatedContent: (content) => set({ animatedContent: content }),
        isExpanded: false,
        setIsExpanded: (expanded) => set({ isExpanded: expanded }),
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
