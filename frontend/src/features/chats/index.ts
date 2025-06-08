// Barrel exports for chat feature - clean public API
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
