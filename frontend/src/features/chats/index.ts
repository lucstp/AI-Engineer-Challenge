// Barrel exports for chat feature - clean public API
//
// IMPORT PATTERN GUIDELINES:
// - External imports: Use this barrel export from outside the chat feature
//   Example: import { ChatProvider, useChat } from '@/features/chats'
//
// - Internal imports: Use direct imports within the chat feature to avoid circular dependencies
//   Example: import { useChat } from '../hooks/use-chat'
//             import type { ChatContextType } from '../types/chat'
//
// This maintains clean external APIs while avoiding circular dependencies within the feature.
export type {
  Message,
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

export { useChat } from './hooks/use-chat';
export { ChatProvider, useChatContext, withChatContext, ChatContext } from './context/chat-context';
