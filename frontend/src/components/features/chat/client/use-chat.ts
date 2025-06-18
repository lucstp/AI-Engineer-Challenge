'use client';

import { useCallback, useTransition } from 'react';
import { sendMessageAction } from '@/app/actions/chat-actions';
import { useChatStore } from '@/store';
import type { Message } from '@/types';

export function useChat() {
  const [isPending, startTransition] = useTransition();

  // Store state and actions
  const {
    messages,
    apiKey,
    selectedModel,
    isLoading,
    isTyping,
    animatedContent,
    isAnimating,
    apiKeyError,
    isApiKeyValid,
    addMessage,
    setIsLoading,
    setIsTyping,
    setAnimatedContent,
    setIsAnimating,
  } = useChatStore();

  /**
   * Send a message with streaming response handling
   */
  const sendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || !isApiKeyValid || isLoading) {
        return;
      }

      try {
        setIsLoading(true);
        setIsTyping(false);

        // Add user message to store
        const userMessage: Message = {
          id: `user-${Date.now()}`,
          role: 'user',
          content: messageText.trim(),
          timestamp: new Date().toISOString(),
        };
        addMessage(userMessage);

        // Prepare assistant message placeholder
        const assistantMessageId = `assistant-${Date.now()}`;
        const assistantMessage: Message = {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
        };
        addMessage(assistantMessage);

        // Start streaming animation
        setIsAnimating(true);
        setAnimatedContent('');

        // Use server action for sending
        startTransition(async () => {
          const formData = new FormData();
          formData.append('message', messageText.trim());
          formData.append('model', selectedModel);
          formData.append('apiKey', apiKey);
          formData.append('developerMessage', 'You are a helpful AI assistant.');

          try {
            const result = await sendMessageAction({ message: '', success: false }, formData);

            if (result.success) {
              // Message sent successfully
              console.log('Message sent:', result.message);
            } else {
              throw new Error(result.message || 'Failed to send message');
            }
          } catch (error) {
            console.error('Message sending failed:', error);
            // Update the assistant message with error
            const errorMessage: Message = {
              ...assistantMessage,
              content: 'Sorry, I encountered an error. Please try again.',
            };
            // You would update the message in the store here
          }
        });
      } catch (error) {
        console.error('Send message error:', error);
        setIsLoading(false);
        setIsAnimating(false);
      }
    },
    [
      apiKey,
      selectedModel,
      isApiKeyValid,
      isLoading,
      addMessage,
      setIsLoading,
      setIsTyping,
      setIsAnimating,
      setAnimatedContent,
    ],
  );

  /**
   * Handle streaming response from the server
   */
  const handleStreamingResponse = useCallback(
    async (stream: ReadableStream, _messageId: string) => {
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

          // Update animated content for typewriter effect
          setAnimatedContent(fullContent);
        }

        // Finalize the message
        setIsTyping(false);
        setIsAnimating(false);
        setAnimatedContent('');

        // Update the message in the store with final content
        // This would require an updateMessage action in the store
        console.log('Final message content:', fullContent);
      } catch (error) {
        console.error('Streaming error:', error);
        setIsTyping(false);
        setIsAnimating(false);
        setAnimatedContent('');
      } finally {
        setIsLoading(false);
      }
    },
    [setIsTyping, setIsAnimating, setAnimatedContent, setIsLoading],
  );

  return {
    // State
    messages,
    apiKey,
    selectedModel,
    isLoading: isLoading || isPending,
    isTyping,
    animatedContent,
    isAnimating,
    apiKeyError,
    isApiKeyValid,

    // Actions
    sendMessage,
  };
}
