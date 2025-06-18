/**
 * Chat Feature Types - Modern Type System
 *
 * Modern approach following DDD Frontend Architecture:
 * - Import from global types (@/types) for core entities
 * - Define only feature-specific types here
 * - Complex component props (5+ properties) only
 * - Zero duplication with global type system
 */

// Import core types from global types system
import type { Message } from '@/types';

// Re-export commonly used types for convenience
export type { Message } from '@/types';

// ============================================================================
// COMPONENT PROP TYPES - Complex Feature-Specific (5+ Properties)
// ============================================================================

/**
 * MessageBubble component props (6 properties)
 */
export interface MessageBubbleProps {
  message: Message;
  isAnimating?: boolean;
  animatedContent?: string;
  onAnimationComplete?: () => void;
  showAvatar?: boolean;
  className?: string;
}

/**
 * MessageList component props (5 properties)
 */
export interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  animatedContent?: string;
  isAnimating: boolean;
}

/**
 * ChatInput component props (9 properties) - for upcoming implementation
 */
export interface ChatInputProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  onSend: (message: string) => Promise<void>;
  isLoading: boolean;
  apiKeyError?: string | null;
  onDeleteApiKey: () => void;
  className?: string;
}

/**
 * ModelSelector component props (4 properties)
 */
export interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

// ============================================================================
// FEATURE-SPECIFIC CONFIGURATIONS
// ============================================================================

/**
 * Available AI models configuration
 */
export interface ModelOption {
  id: string;
  name: string;
  description?: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', description: 'Fast and efficient' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'High performance' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Reliable and cost-effective' },
] as const;

/**
 * Chat feature configuration
 */
export interface ChatConfig {
  maxMessageLength: number;
  typingDelay: number;
  animationSpeed: number;
  apiKeyMinLength: number;
}

export const DEFAULT_CHAT_CONFIG: ChatConfig = {
  maxMessageLength: 4000,
  typingDelay: 100,
  animationSpeed: 10,
  apiKeyMinLength: 20,
} as const;
