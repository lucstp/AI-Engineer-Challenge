'use client';

import { useCallback, useTransition } from 'react';
import { sendMessageAction } from '@/app/actions/chat-actions';
import { useChatStore } from '@/store';
import type { Message } from '@/types';

export function useChat() {
  const [isPending, startTransition] = useTransition();

  // SECURE: No direct API key access
  const {
    messages,
    hasValidApiKey,
    apiKeyType,
    selectedModel,
    isLoading,
    isTyping,
    animatedContent,
    isAnimating,
    apiKeyError,
    addMessage,
    updateMessage,
    setIsLoading,
    setIsTyping,
    setAnimatedContent,
    setIsAnimating,
  } = useChatStore();

  /**
   * MODERN + SECURE + CHALLENGE COMPLIANT: Direct Server Action streaming
   */
  const sendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || !hasValidApiKey || isLoading) {
        return;
      }

      try {
        setIsLoading(true);
        setIsTyping(false);

        // Add user message
        const userMessage: Message = {
          id: `user-${Date.now()}`,
          role: 'user',
          content: messageText.trim(),
          timestamp: new Date().toISOString(),
        };
        addMessage(userMessage);

        // Add assistant placeholder
        const assistantMessageId = `assistant-${Date.now()}`;
        const assistantMessage: Message = {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
        };
        addMessage(assistantMessage);

        // Start animation
        setIsAnimating(true);
        setAnimatedContent('');

        startTransition(async () => {
          try {
            // MODERN: Direct Server Action call (no API route)
            const formData = new FormData();
            formData.append('message', messageText.trim());
            formData.append('model', selectedModel);
            formData.append('developerMessage', 'You are a helpful AI assistant.');

            const result = await sendMessageAction({ success: false, message: '' }, formData);

            if (result.success && result.streamingResponse) {
              // MODERN: Handle streaming directly from Server Action
              await handleStreamingResponse(result.streamingResponse, assistantMessageId);
            } else {
              // Handle errors
              const errorMessage =
                result.errors?.message?.[0] ||
                result.errors?.apiKey?.[0] ||
                'Failed to send message';

              updateMessage(assistantMessageId, { content: errorMessage });
              setIsAnimating(false);
              setAnimatedContent('');
            }
          } catch (error) {
            console.error('Message sending failed:', error);
            updateMessage(assistantMessageId, {
              content: 'Sorry, I encountered an error. Please try again.',
            });
            setIsAnimating(false);
            setAnimatedContent('');
          } finally {
            setIsLoading(false);
          }
        });
      } catch (error) {
        console.error('Send message error:', error);
        setIsLoading(false);
        setIsAnimating(false);
      }
    },
    [
      hasValidApiKey,
      selectedModel,
      isLoading,
      addMessage,
      updateMessage,
      setIsLoading,
      setIsTyping,
      setIsAnimating,
      setAnimatedContent,
    ],
  );

  /**
   * Handle streaming response with typewriter effect
   */
  const handleStreamingResponse = useCallback(
    async (stream: ReadableStream, messageId: string) => {
      try {
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        setIsTyping(true);

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;
          setAnimatedContent(fullContent);
        }

        // Finalize message
        updateMessage(messageId, { content: fullContent });
        setIsTyping(false);
        setIsAnimating(false);
        setAnimatedContent('');
      } catch (error) {
        console.error('Streaming error:', error);
        updateMessage(messageId, {
          content: 'Error occurred while receiving response.',
        });
        setIsTyping(false);
        setIsAnimating(false);
        setAnimatedContent('');
      }
    },
    [updateMessage, setIsTyping, setIsAnimating, setAnimatedContent],
  );

  return {
    // SECURE State
    messages,
    hasValidApiKey,
    apiKeyType,
    selectedModel,
    isLoading: isLoading || isPending,
    isTyping,
    animatedContent,
    isAnimating,
    apiKeyError,

    // Actions
    sendMessage,
  };
}
