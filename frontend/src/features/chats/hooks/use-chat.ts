// React 19 optimized chat state management hook
'use client';

import { useCallback, useOptimistic, useState, useTransition } from 'react';

import type {
  ChatApiResponse,
  ChatContextType,
  ChatState,
  Message,
  OptimisticMessage,
} from '../types/chat';

// Generate unique message ID
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create message with timestamp
function createMessage(content: string, role: Message['role']): Message {
  return {
    id: generateMessageId(),
    content,
    role,
    timestamp: new Date().toISOString(),
    showTimestamp: false,
  };
}

// Initial chat state
const initialChatState: ChatState = {
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
  apiKey: '',
};

export function useChat(): ChatContextType {
  // Core state management
  const [chatState, setChatState] = useState<ChatState>(initialChatState);
  const [isPending, startTransition] = useTransition();

  // React 19 useOptimistic for immediate UI updates
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    chatState.messages,
    (state: Message[], newMessage: OptimisticMessage): Message[] => [
      ...state,
      {
        ...newMessage,
        id: generateMessageId(),
        timestamp: new Date().toISOString(),
        isOptimistic: true,
      },
    ],
  );

  // API key management
  const setApiKey = useCallback((key: string) => {
    setChatState((prev) => ({ ...prev, apiKey: key }));
  }, []);

  // Send message with optimistic updates
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !chatState.apiKey) {
        setChatState((prev) => ({
          ...prev,
          error: !chatState.apiKey ? 'API key is required' : 'Message cannot be empty',
        }));
        return;
      }

      // Prevent concurrent sends
      if (chatState.isSending) {
        setChatState((prev) => ({
          ...prev,
          error: 'Please wait for the current message to complete',
        }));
        return;
      }

      const userMessage = createMessage(content, 'user');

      // Capture current state to avoid stale closures
      const currentApiKey = chatState.apiKey;
      const currentMessages = chatState.messages;

      // Add user message to base state and set isSending flag
      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,
        isSending: true,
        error: null,
      }));

      // Add optimistic assistant response
      addOptimisticMessage({
        content: 'Thinking...',
        role: 'assistant',
        isOptimistic: true,
      });

      startTransition(async () => {
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${currentApiKey}`,
            },
            body: JSON.stringify({
              message: content,
              // Include the just-added user message for full context
              messages: [...currentMessages, userMessage],
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data: ChatApiResponse = await response.json();

          if (!data.success && data.error) {
            throw new Error(data.error);
          }

          const assistantMessage = createMessage(data.message, 'assistant');

          setChatState((prev) => ({
            ...prev,
            messages: [...prev.messages, assistantMessage],
            isLoading: false,
            isSending: false,
            error: null,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to send message';

          setChatState((prev) => ({
            ...prev,
            isLoading: false,
            isSending: false,
            error: errorMessage,
          }));
        }
      });
    },
    [chatState.apiKey, chatState.messages, chatState.isSending, addOptimisticMessage],
  );

  // Clear all messages
  const clearMessages = useCallback(() => {
    setChatState((prev) => ({
      ...prev,
      messages: [],
      error: null,
    }));
  }, []);

  // Regenerate last assistant response
  const regenerateResponse = useCallback(async () => {
    // Prevent regeneration if already sending
    if (chatState.isSending) {
      setChatState((prev) => ({
        ...prev,
        error: 'Cannot regenerate while sending a message',
      }));
      return;
    }

    const messages = chatState.messages;
    const lastUserMessageIndex = messages.findLastIndex((msg) => msg.role === 'user');

    if (lastUserMessageIndex === -1) {
      setChatState((prev) => ({ ...prev, error: 'No user message to regenerate from' }));
      return;
    }

    const lastUserMessage = messages[lastUserMessageIndex];

    // Remove messages after the last user message
    const messagesUpToUser = messages.slice(0, lastUserMessageIndex + 1);

    setChatState((prev) => ({
      ...prev,
      messages: messagesUpToUser,
      error: null,
    }));

    // Resend the last user message
    await sendMessage(lastUserMessage.content);
  }, [chatState.messages, chatState.isSending, sendMessage]);

  // Manual optimistic message addition (for advanced use cases)
  const addOptimisticMessageManual = useCallback(
    (message: Omit<Message, 'id' | 'timestamp'>) => {
      addOptimisticMessage({
        ...message,
        isOptimistic: true,
      });
    },
    [addOptimisticMessage],
  );

  return {
    // State (using optimistic messages for UI)
    messages: optimisticMessages,
    isLoading: chatState.isLoading || isPending,
    isSending: chatState.isSending,
    error: chatState.error,
    apiKey: chatState.apiKey,

    // Actions
    setApiKey,
    sendMessage,
    clearMessages,
    regenerateResponse,
    addOptimisticMessage: addOptimisticMessageManual,
  };
}
