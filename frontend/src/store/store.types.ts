import { z } from 'zod';

// Zod schema for API key validation (OpenAI keys are exactly 51 characters as of 2025)
export const apiKeySchema = z
  .string()
  .length(51, 'API key must be exactly 51 characters long')
  .regex(/^sk-[A-Za-z0-9_-]{48}$/, 'API key must start with "sk-" and be valid');

// Helper for direct format validation (for unit testing and clarity)
export function isKeyFormatValid(key: string): boolean {
  return /^sk-[A-Za-z0-9_-]{48}$/.test(key);
}

// Core message interface
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  animated?: boolean;
  showTimestamp?: boolean;
}

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
  setShowTimestamps: (show: boolean) => void;
  isAnimating: boolean;
  setIsAnimating: (animating: boolean) => void;
  animatedContent: string;
  setAnimatedContent: (content: string) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;

  // Testing utilities
  reset: () => void;
}
