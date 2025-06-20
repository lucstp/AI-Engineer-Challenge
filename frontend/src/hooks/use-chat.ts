'use client';

import { useCallback, useState } from 'react';
import { useChatStore } from '@/store';
import type { Message } from '@/types';

/**
 * Enhanced useChat hook that integrates with the streaming route handler
 * and provides secure message sending with proper error handling.
 */
export function useChat() {
  const [isStreaming, setIsStreaming] = useState(false);
  const {
    addMessage,
    updateMessage,
    setIsLoading,
    setIsTyping,
    setIsAnimating,
    setAnimatedContent,
    selectedModel,
  } = useChatStore();

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) {
        throw new Error('Message cannot be empty');
      }

      setIsLoading(true);
      setIsTyping(true);
      setIsStreaming(true);

      try {
        // Add user message immediately
        const userMessage: Message = {
          id: `user-${Date.now()}`,
          content: content.trim(),
          role: 'user',
          timestamp: new Date().toISOString(),
        };
        addMessage(userMessage);

        // Prepare assistant message for streaming
        const assistantMessageId = `assistant-${Date.now()}`;
        const assistantMessage: Message = {
          id: assistantMessageId,
          content: '',
          role: 'assistant',
          timestamp: new Date().toISOString(),
        };
        addMessage(assistantMessage);

        // Start animation state
        setIsAnimating(true);
        setAnimatedContent('');

        // Call the streaming route handler
        const response = await fetch('/api/chat-stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content.trim(),
            model: selectedModel,
            developerMessage: 'You are a helpful AI assistant.',
          }),
        });

        if (!response.ok) {
          // Handle error response
          let errorMessage = 'Failed to send message';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = `Server error: ${response.status}`;
          }
          throw new Error(errorMessage);
        }

        // Handle streaming response
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response stream available');
        }

        const decoder = new TextDecoder();
        let accumulatedContent = '';

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            // Decode the chunk
            const chunk = decoder.decode(value, { stream: true });
            accumulatedContent += chunk;

            // Update the message with accumulated content
            updateMessage(assistantMessageId, { content: accumulatedContent });

            // Update animated content for typewriter effect
            setAnimatedContent(accumulatedContent);
          }
        } finally {
          reader.releaseLock();
        }

        // Final update to ensure message is complete
        updateMessage(assistantMessageId, {
          content: accumulatedContent,
          timestamp: new Date().toISOString(),
        });

        console.log('✅ Message sent and streamed successfully');
      } catch (error) {
        console.error('❌ Failed to send message:', error);

        // Add error message to chat
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
          role: 'assistant',
          timestamp: new Date().toISOString(),
        };
        addMessage(errorMessage);

        // Re-throw for the component to handle
        throw error;
      } finally {
        setIsLoading(false);
        setIsTyping(false);
        setIsStreaming(false);
        setIsAnimating(false);
      }
    },
    [
      addMessage,
      updateMessage,
      setIsLoading,
      setIsTyping,
      setIsAnimating,
      setAnimatedContent,
      selectedModel,
    ],
  );

  return {
    sendMessage,
    isStreaming,
  };
}
