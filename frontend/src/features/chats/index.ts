// Barrel exports for chat feature - clean public API
//
// PHASE 2 MIGRATION NOTE:
// - React Context and useChat hook have been migrated to Zustand store
// - New store location: @/store/chat-store
// - This file now re-exports types and points to the new architecture
//
// IMPORT PATTERN GUIDELINES:
// - External imports: Use @/store for chat state management
//   Example: import { useChatStore, type Message } from '@/store'
//
// - For legacy compatibility, some types are still exported from here
//   Example: import type { ChatState } from '@/features/chats'

// Re-export Message type from new store for compatibility
export type { Message } from '@/store/chat-store';

// Legacy types still available from original location
export type {
  ChatState,
  ChatContextType,
  ChatActionResult,
  ChatFormState,
  ChatApiResponse,
  StreamingChatResponse,
  ChatConfig,
  MessageRole,
  MessageContent,
  OptimisticMessage,
} from './types/chat';

// Phase 2: Context and hooks have been replaced with Zustand store
// Use: import { useChatStore } from '@/store' instead
