/**
 * Chat Feature Types - Legacy Compatibility Only
 *
 * @deprecated Most types have moved to @/types
 *
 * This file contains only legacy types that will be removed in Phase 4:
 * - ChatContextType (legacy React Context pattern)
 * - ChatActionResult (use ActionResult from @/types instead)
 * - ChatFormState (use FormState from @/types instead)
 *
 * For new code, use:
 * ✅ import type { Message, ChatApiResponse } from '@/types';
 * ✅ import type { ChatState } from '@/store/store.types';
 */

// Import types for use in legacy interfaces
import type { Message } from '@/types';

// Re-export modern types from global types (avoid duplication)
export type {
  Message,
  MessageRole,
  MessageContent,
  OptimisticMessage,
  ChatApiResponse,
  StreamingChatResponse,
  ChatConfig,
} from '@/types';

// ============================================================================
// LEGACY TYPES - Will be removed in Phase 4
// ============================================================================

/**
 * Legacy ChatState for ChatContextType compatibility
 * This is a simplified version that doesn't include Zustand actions
 */
export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  apiKey: string;
}

/**
 * @deprecated Use ActionResult<Message> from @/types instead
 */
export interface ChatActionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: Message;
}

/**
 * @deprecated Use FormState from @/types instead
 */
export interface ChatFormState {
  message: string;
  errors?: Record<string, string[]>;
  success?: boolean;
}

/**
 * @deprecated Legacy React Context pattern
 * Modern replacement: useChatStore from @/store
 */
export interface ChatContextType extends ChatState {
  // State setters
  setApiKey: (key: string) => void;

  // Actions using React 19 patterns
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  regenerateResponse: () => Promise<void>;

  // Optimistic updates
  addOptimisticMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
}
