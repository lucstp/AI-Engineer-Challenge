/**
 * Chat Feature - Silicon Valley DDD Frontend Architecture
 *
 * Modern component-based architecture following enterprise patterns:
 * - Server Components for static content and data fetching
 * - Client Components for interactions and animations
 * - Feature-specific types with global type integration
 * - Clean barrel exports for external consumption
 */

// ============================================================================
// SERVER COMPONENTS - Static content, data fetching, SSR
// ============================================================================
// Currently no server components - all moved to client due to interactive requirements

// ============================================================================
// CLIENT COMPONENTS - Interactions, animations, state
// ============================================================================
export {
  TypewriterMessage,
  AnimatedMessageContainer,
  MessageBubble,
  MessageList,
  TypingIndicator,
  ChatInput,
  ModelSelector,
} from './client';

// ============================================================================
// TYPES - Feature-specific with global type integration
// ============================================================================
export type {
  // Complex component prop types (5+ properties)
  MessageBubbleProps,
  MessageListProps,
  ChatInputProps,

  // Configuration types
  ModelOption,
  ChatConfig,

  // Re-exported global types for convenience
  Message,
} from './chat.types';

// Note: Simple prop interfaces (1-4 properties) are kept inline in components:
// - TypewriterMessageProps (4 props) - inline in TypewriterMessage
// - ModelSelectorProps (4 props) - inline when component is created
// - TypingIndicatorProps (1 prop) - inline when component is created

// Export configuration constants
export { AVAILABLE_MODELS, DEFAULT_CHAT_CONFIG } from './chat.types';
