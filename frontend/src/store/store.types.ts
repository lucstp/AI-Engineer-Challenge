/**
 * Store Type Definitions
 *
 * Contains only TypeScript types for the Zustand store
 */

// Import types for use in this file
import type { Message } from '@/types';

// Re-export core types from global types (single source of truth)
export type { Message, MessageRole, MessageContent } from '@/types';

// Complete chat state interface
export interface ChatState {
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
  setShowTimestamps: (show: boolean | ((prev: boolean) => boolean)) => void;
  isAnimating: boolean;
  setIsAnimating: (animating: boolean) => void;
  animatedContent: string;
  setAnimatedContent: (content: string) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;

  // Testing utilities
  reset: () => void;
}
