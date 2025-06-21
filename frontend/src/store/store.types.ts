// src/store/store.types.ts
import type { Message } from '@/types';
import type { StateCreator } from 'zustand';

// Chat slice for messages and streaming
export interface ChatSlice {
  // State
  messages: Message[];
  selectedModel: string;

  // Actions
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  clearMessages: () => void;
  setSelectedModel: (model: string) => void;
}

// UI slice for animations and interface state
export interface UiSlice {
  // State
  isLoading: boolean;
  isTyping: boolean;
  showTimestamps: boolean;
  isAnimating: boolean;
  animatedContent: string;
  isExpanded: boolean;

  // Animation states for UX flow
  animationMode: 'welcome' | 'expanded' | 'collapsed';
  backgroundMode: 'invalid' | 'valid' | 'neutral';
  shouldAnimateExpansion: boolean;

  // Persistence flags
  hasSeenWelcomeAnimation: boolean;

  // Actions
  setIsLoading: (loading: boolean) => void;
  setIsTyping: (typing: boolean) => void;
  setShowTimestamps: (show: boolean) => void;
  setIsAnimating: (animating: boolean) => void;
  setAnimatedContent: (content: string) => void;
  setIsExpanded: (expanded: boolean) => void;
  setAnimationMode: (mode: 'welcome' | 'expanded' | 'collapsed') => void;
  setBackgroundMode: (mode: 'invalid' | 'valid' | 'neutral') => void;
  setShouldAnimateExpansion: (should: boolean) => void;
  setHasSeenWelcomeAnimation: (seen: boolean) => void;
  cleanup: () => void;
}

// Auth slice for API key management (secure)
export interface AuthSlice {
  // State
  hasValidApiKey: boolean;
  apiKeyType: string | null;
  apiKeyLength: number | null;
  apiKeyError: string | null;
  hasCompletedInitialSetup: boolean;
  lastSuccessfulKeyType: string | null;

  // Actions
  setApiKey: (key: string) => Promise<{ success: boolean; error: string | null }>;
  deleteApiKey: () => Promise<void>;
  setHasCompletedInitialSetup: (completed: boolean) => void;
}

// System slice for initialization and session
export interface SystemSlice {
  // State
  isInitialized: boolean;
  isRehydrated: boolean;

  // Actions
  initializeStore: () => void;
  checkSession: () => Promise<void>;
  checkWelcomeAnimation: () => void;
  setIsRehydrated: (rehydrated: boolean) => void;
  reset: () => Promise<void>;
}

// Combined store type
export type StoreState = ChatSlice & UiSlice & AuthSlice & SystemSlice;

// State creator helper type for combined store
export type SliceStateCreator<T> = StateCreator<StoreState, [], [], T>;

// Individual slice state creators for testing
export type ChatSliceCreator = StateCreator<ChatSlice, [], [], ChatSlice>;
export type UiSliceCreator = StateCreator<UiSlice, [], [], UiSlice>;
export type AuthSliceCreator = StateCreator<AuthSlice, [], [], AuthSlice>;
export type SystemSliceCreator = StateCreator<SystemSlice, [], [], SystemSlice>;

// Legacy support - re-export as ChatState for backward compatibility
export type ChatState = StoreState;
