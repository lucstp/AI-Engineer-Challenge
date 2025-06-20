// src/store/store.types.ts
import type { Message } from '@/types';

export interface ChatState {
  // Messages state - ALWAYS an array, never undefined
  messages: Message[];

  // API Key state (secure - no direct storage)
  hasValidApiKey: boolean;
  apiKeyType: string | null;
  apiKeyLength: number | null;
  apiKeyError: string | null;
  isInitialized: boolean;
  isRehydrated: boolean; // Track Zustand persistence rehydration completion
  selectedModel: string;

  // UI state
  isLoading: boolean;
  isTyping: boolean;
  showTimestamps: boolean;
  isAnimating: boolean;
  animatedContent: string;
  isExpanded: boolean;

  // Animation and persistence flags
  hasSeenWelcomeAnimation: boolean;
  hasCompletedInitialSetup: boolean;
  lastSuccessfulKeyType: string | null;

  // Actions
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  clearMessages: () => void;

  // API Key actions
  setApiKey: (key: string) => Promise<{ success: boolean; error: string | null }>;
  deleteApiKey: () => Promise<void>;

  // System actions
  initializeStore: () => void;
  checkSession: () => Promise<void>;

  // UI actions
  setSelectedModel: (model: string) => void;
  setIsLoading: (loading: boolean) => void;
  setIsTyping: (typing: boolean) => void;
  setShowTimestamps: (show: boolean) => void;
  setIsAnimating: (animating: boolean) => void;
  setAnimatedContent: (content: string) => void;
  setIsExpanded: (expanded: boolean) => void;

  // Animation control actions
  setHasSeenWelcomeAnimation: (seen: boolean) => void;
  setHasCompletedInitialSetup: (completed: boolean) => void;

  // Utility actions
  reset: () => Promise<void>;
}
