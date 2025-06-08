// TypeScript types for chat messages and chat state following React 19 patterns
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  showTimestamp?: boolean;
  isOptimistic?: boolean; // For React 19 useOptimistic
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  apiKey: string;
}

// React 19 Action result type for Server Actions
export interface ChatActionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: Message;
}

// Form state for React 19 useActionState
export interface ChatFormState {
  message: string;
  errors?: Record<string, string[]>;
  success?: boolean;
}

// Context type with React 19 patterns
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

// API response types
export interface ChatApiResponse {
  message: string;
  success?: boolean;
  error?: string;
}

// Streaming response for real-time chat
export interface StreamingChatResponse {
  content: string;
  done: boolean;
  error?: string;
}

// Configuration types
export interface ChatConfig {
  apiEndpoint: string;
  maxMessages?: number;
  retryAttempts?: number;
  streamingEnabled?: boolean;
}

// Utility types for message operations
export type MessageRole = Message['role'];
export type MessageContent = Pick<Message, 'content' | 'role'>;
export type OptimisticMessage = Omit<Message, 'id' | 'timestamp'> & { isOptimistic: true };
