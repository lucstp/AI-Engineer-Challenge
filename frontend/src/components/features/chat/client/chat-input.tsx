'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Textarea } from '@/components/ui';
import { useChat } from '@/hooks/use-chat';
import { useChatStore } from '@/store';
import { Send } from 'lucide-react';
import { useFormStatus } from 'react-dom';

import { ApiKeySection } from './api-key-section';

/**
 * Renders a submit button for the chat input form, disabling it when a submission is pending or the API key is invalid.
 *
 * The button includes a send icon and applies conditional styling based on its enabled state. It is accessible and communicates its disabled state to assistive technologies.
 */
function SubmitButton() {
  const { pending } = useFormStatus();
  const { hasValidApiKey } = useChatStore(); // SECURE: Use boolean flag

  return (
    <Button
      type="submit"
      disabled={pending || !hasValidApiKey}
      className={`flex size-8 items-center justify-center rounded-lg border border-solid border-white/30 bg-transparent p-0 text-white/70 shadow-[rgba(0,0,0,0.3)_0px_2px_4px_0px] disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-white/30 disabled:hover:bg-transparent ${
        !pending && hasValidApiKey
          ? 'hover:border-white/40 hover:bg-white/20'
          : 'hover:bg-transparent'
      }`}
    >
      <Send className="size-4" />
    </Button>
  );
}

/**
 * Renders a chat input form with secure API key validation, message sending, and user feedback.
 *
 * The component manages input state, handles secure message submission using a protected API key, and provides accessibility features such as auto-focus, auto-resizing, and keyboard shortcuts. Displays contextual status messages for errors, missing API key, or usage instructions.
 */
export function ChatInput() {
  const [input, setInput] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // SECURE: Use session state instead of direct key access
  const { isLoading, hasValidApiKey } = useChatStore();

  // Import useChat for the secure sendMessage function
  const { sendMessage: secureSendMessage } = useChat();

  // Auto-focus textarea when API key is valid
  useEffect(() => {
    if (!isLoading && hasValidApiKey) {
      textareaRef.current?.focus();
    }
  }, [isLoading, hasValidApiKey]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = '48px';
    const { scrollHeight } = textarea;
    const maxHeight = 200;
    textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
  });

  // Auto-clear send errors after 5 seconds
  useEffect(() => {
    if (sendError) {
      const timer = setTimeout(() => {
        setSendError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [sendError]);

  // Shared message sending logic
  const sendMessageHandler = async () => {
    if (!input.trim() || !hasValidApiKey || isLoading) {
      return;
    }

    const message = input.trim();
    setInput(''); // Clear input immediately
    setSendError(null); // Clear any previous errors

    try {
      // Use secure send message from useChat hook
      await secureSendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
      setSendError(
        error instanceof Error ? error.message : 'Failed to send message. Please try again.',
      );
      // Restore the message to input if sending failed
      setInput(message);
    }

    // Refocus textarea
    textareaRef.current?.focus();
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await sendMessageHandler();
  };

  // Handle Enter key for submission
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await sendMessageHandler();
    }
  };

  return (
    <div className="mt-auto pt-4">
      <form onSubmit={handleSubmit} className="space-y-0">
        {/* SECURE API Key Section */}
        <ApiKeySection />

        {/* Message Input Area */}
        <div className="relative mb-3 flex">
          <div className="relative flex-1">
            <Textarea
              ref={textareaRef}
              name="message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className="min-h-[48px] w-full flex-1 resize-none rounded-lg rounded-t-none border-none bg-white/10 py-3.5 pr-16 font-sans text-base leading-none text-white placeholder:text-white/40 focus:border-none focus:bg-white/20 focus:ring-0 focus:outline-none"
              disabled={!hasValidApiKey}
              required
              minLength={1}
              maxLength={4000}
              aria-describedby="message-error"
            />
          </div>
          <div className="absolute right-2 bottom-2">
            <SubmitButton />
          </div>
        </div>

        {/* Status Messages */}
        {sendError ? (
          <p className="mb-1 text-center text-xs text-red-300">❌ {sendError}</p>
        ) : !hasValidApiKey ? (
          <p className="mb-1 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] text-center text-xs text-yellow-300">
            ⚠️ An OpenAI API key is required to use this assistant
          </p>
        ) : (
          <p className="mb-1 text-center text-xs text-blue-200">
            Press Enter to send, Shift + Enter for new line
          </p>
        )}
      </form>
    </div>
  );
}
