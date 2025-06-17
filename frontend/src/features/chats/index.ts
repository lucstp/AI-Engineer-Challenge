/**
 * Chat Feature - Legacy Compatibility Layer
 *
 * @deprecated This module provides legacy compatibility only.
 *
 * Modern usage:
 * ✅ import type { Message, ChatApiResponse } from '@/types';
 * ✅ import { useChatStore } from '@/store';
 *
 * Legacy (being phased out):
 * ❌ import type { Message } from '@/features/chats';
 */

// PHASE 3 MIGRATION: Use @/types instead
export type {
  Message,
  MessageRole,
  MessageContent,
  OptimisticMessage,
  ChatApiResponse,
  StreamingChatResponse,
  ChatConfig,
} from '@/types';

// Legacy types (will be removed in next phase)
export type { ChatState, ChatContextType, ChatActionResult, ChatFormState } from './types/chat';

/**
 * MIGRATION GUIDE:
 *
 * 1. Replace chat feature imports:
 *    Old: import type { Message } from '@/features/chats';
 *    New: import type { Message } from '@/types';
 *
 * 2. Replace state management:
 *    Old: useChatContext, ChatProvider
 *    New: useChatStore from '@/store'
 *
 * 3. Replace form patterns:
 *    Old: ChatFormState, ChatActionResult
 *    New: FormState, ActionResult from '@/types'
 */
