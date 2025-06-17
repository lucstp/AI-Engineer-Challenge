// ============================================================================
// UI COMPONENT TYPES
// ============================================================================

/**
 * Base component props pattern
 */
import type { ReactNode } from 'react';

/**
 * Global Types - Enterprise Type System
 *
 * Modern architecture following domain-driven design principles:
 * - Single source of truth for each type
 * - Clear separation between global and domain types
 * - Minimal abstraction, maximum clarity
 * - Zero circular dependencies
 */

// ============================================================================
// CORE DOMAIN TYPES - Single Source of Truth
// ============================================================================

/**
 * Core message entity - THE definitive Message type
 * Used across store, components, and features
 */
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  animated?: boolean;
  showTimestamp?: boolean;
  isOptimistic?: boolean; // React 19 useOptimistic support
}

/**
 * Message utility types
 */
export type MessageRole = Message['role'];
export type MessageContent = Pick<Message, 'content' | 'role'>;
export type OptimisticMessage = Omit<Message, 'id' | 'timestamp'> & { isOptimistic: true };

// ============================================================================
// API & ACTION TYPES - React 19 Patterns
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

/**
 * Server Action result type (React 19)
 */
export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/**
 * Form state for React 19 useActionState
 */
export interface FormState {
  message: string;
  errors?: Record<string, string[]>;
  success?: boolean;
}

// ============================================================================
// CHAT DOMAIN TYPES
// ============================================================================

/**
 * Chat API response types
 */
export interface ChatApiResponse {
  message: string;
  success?: boolean;
  error?: string;
}

/**
 * Streaming chat response
 */
export interface StreamingChatResponse {
  content: string;
  done: boolean;
  error?: string;
}

/**
 * Chat configuration
 */
export interface ChatConfig {
  apiEndpoint: string;
  maxMessages?: number;
  retryAttempts?: number;
  streamingEnabled?: boolean;
}

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// ============================================================================
// DEPRECATION NOTICE
// ============================================================================

/**
 * @deprecated Import from @/types directly instead of feature modules
 *
 * Modern usage:
 * ✅ import type { Message, ChatApiResponse } from '@/types';
 *
 * Legacy (deprecated):
 * ❌ import type { Message } from '@/features/chats';
 * ❌ import type { Message } from '@/store/store.types';
 */
