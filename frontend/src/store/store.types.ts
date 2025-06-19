/**
 * Store Type Definitions
 *
 * Contains only TypeScript types for the Zustand store
 */

// Import types for use in this file
import type { Message } from '@/types';

// Re-export core types from global types (single source of truth)
export type { Message } from '@/types';

/**
 * Secure Chat State Interface - Updated for Production Security
 * Following Silicon Valley DDD - Single Source of Truth for Store Types
 *
 * SECURITY: No direct API key storage on client-side
 */
export interface ChatState {
  // Messages state
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  clearMessages: () => void;

  // SECURE API Key state (session-based, no direct storage)
  hasValidApiKey: boolean;
  apiKeyType: string | null;
  apiKeyLength: number | null;
  apiKeyError: string | null;
  setApiKey: (key: string) => Promise<void>;
  deleteApiKey: () => Promise<void>;

  // Initialization
  isInitialized: boolean;
  initializeStore: () => void;
  checkSession: () => Promise<void>;

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

  // Testing utilities
  reset: () => Promise<void>;
}

/**
 * API Key Session State (server-side only information)
 * Used for secure session management
 */
export interface ApiKeySessionInfo {
  hasValidKey: boolean;
  keyType?: string;
  keyLength?: number;
  expiresAt?: number;
}

/**
 * Form state types for secure chat implementation
 */
export interface SecureChatFormState {
  success: boolean;
  message?: string;
  errors?: {
    message?: string[];
    apiKey?: string[];
    general?: string[];
  };
}

/**
 * @deprecated - Direct API key storage removed for security
 *
 * Legacy interface maintained for backward compatibility during migration
 * MIGRATION PATH: Remove after all components updated to secure patterns
 */
export interface LegacyChatState {
  /** @deprecated Direct API key storage is a security risk */
  apiKey: string;
  /** @deprecated Use hasValidApiKey instead */
  isApiKeyValid: boolean;
  /** @deprecated Use secure session-based validation */
  validateApiKey: (key: string) => void;
}
