'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Textarea } from '@/components/ui';
import { useChat } from '@/hooks/use-chat';
import { useChatStore } from '@/store';
import { Send } from 'lucide-react';
import { useFormStatus } from 'react-dom';

import { ApiKeySection } from './api-key-section';

// Submit button component using useFormStatus
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

// Chat Input Form Component
export function ChatInput() {
  const [input, setInput] = useState('');
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || !hasValidApiKey || isLoading) {
      return;
    }

    const message = input.trim();
    setInput(''); // Clear input immediately

    // Use secure send message from useChat hook
    await secureSendMessage(message);

    // Refocus textarea
    textareaRef.current?.focus();
  };

  // Handle Enter key for submission
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!input.trim() || !hasValidApiKey || isLoading) {
        return;
      }

      const message = input.trim();
      setInput(''); // Clear input immediately

      // Use secure send message from useChat hook
      await secureSendMessage(message);

      // Refocus textarea
      textareaRef.current?.focus();
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
        {!hasValidApiKey ? (
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
