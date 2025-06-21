import { logger } from '@/lib';

import type { ChatSlice, SliceStateCreator } from './store.types';

// Welcome message for initial state
export const createWelcomeMessage = () => ({
  id: 'welcome',
  content:
    "Hello! I'm your AI assistant. To get started, please enter your OpenAI API key in the field below. I'll be ready to help once you've added your key.",
  role: 'assistant' as const,
  timestamp: new Date().toISOString(),
});

/**
 * Chat slice handles messages and chat model selection
 */
export const createChatSlice: SliceStateCreator<ChatSlice> = (set, _get) => ({
  // Initial state - start with welcome message to prevent SSR hydration mismatch
  messages: [createWelcomeMessage()],
  selectedModel: 'gpt-4o-mini',

  // Actions

  /** Adds a new message to the chat state */
  setMessages: (messages) => {
    logger.debug('🔄 setMessages called', {
      component: 'ChatSlice',
      action: 'setMessages',
      messageCount: messages.length,
      messages: messages.map((m) => ({
        id: m.id,
        content: `${(m.content || '').substring(0, 30)}...`,
        role: m.role,
      })),
    });
    set({ messages });
  },

  /** Adds a single message to the existing messages array */
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  /** Updates a specific message by ID with partial updates */
  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg)),
    })),

  /** Clears all messages from the chat */
  clearMessages: () => {
    logger.debug('🗑️ clearMessages called', {
      component: 'ChatSlice',
      action: 'clearMessages',
    });
    set({ messages: [] });
  },

  /** Sets the selected chat model */
  setSelectedModel: (model) => set({ selectedModel: model }),
});
