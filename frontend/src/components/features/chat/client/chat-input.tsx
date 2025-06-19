'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Input, Textarea } from '@/components/ui';
import { useChat } from '@/hooks/use-chat';
import { useChatStore } from '@/store';
import { Eye, EyeOff, Send, Trash2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

import { ModelSelector } from './model-selector';

// Updated form state for secure implementation
interface SecureFormState {
  success: boolean;
  message?: string;
  errors?: {
    apiKey?: string[];
    message?: string[];
  };
}

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

// SECURE API Key section component
function ApiKeySection() {
  // Local state for API key input (not persisted)
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [apiKeyTouched, setApiKeyTouched] = useState(false);

  const { pending } = useFormStatus();

  // SECURE: Get session state from store (no actual keys)
  const {
    hasValidApiKey,
    apiKeyType,
    apiKeyLength,
    selectedModel,
    apiKeyError,
    setApiKey,
    setSelectedModel,
    deleteApiKey,
    setIsExpanded,
    isLoading,
  } = useChatStore();

  // Handle API key input changes (immediate UI feedback)
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setApiKeyInput(value);
    setApiKeyTouched(true);
  };

  // Handle API key validation (server-side)
  const handleApiKeyValidation = async () => {
    if (!apiKeyInput.trim() || isValidating) {
      return;
    }

    setIsValidating(true);
    try {
      // This calls the secure server action and returns success status
      const isValid = await setApiKey(apiKeyInput.trim());

      // Clear input on successful validation (check the actual result)
      if (isValid) {
        setApiKeyInput('');
        setShowApiKey(false);
      }
    } finally {
      setIsValidating(false);
    }
  };

  // Handle Enter key for validation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApiKeyValidation();
    }
  };

  // Handle chat expansion based on API key validity
  useEffect(() => {
    setIsExpanded(hasValidApiKey);
  }, [hasValidApiKey, setIsExpanded]);

  // Handle deleting API key session
  const handleDeleteApiKey = async () => {
    await deleteApiKey();
    setApiKeyInput('');
    setApiKeyTouched(false);
    setShowApiKey(false);
  };

  // Show validation status
  const getValidationStatus = () => {
    if (isValidating || isLoading) {
      return 'validating';
    }
    if (hasValidApiKey) {
      return 'valid';
    }
    if (apiKeyError && apiKeyTouched) {
      return 'error';
    }
    return 'pending';
  };

  const validationStatus = getValidationStatus();

  return (
    <>
      {/* API Key and Model Selector Row */}
      <div className="mb-1.5 rounded-t-xl">
        <div className="flex flex-col items-stretch gap-y-2 sm:flex-row sm:items-center sm:gap-x-1">
          {/* SECURE API Key Input */}
          <div className="relative flex-1 rounded-lg rounded-tl-lg rounded-r-none rounded-b-none bg-white/10 transition-colors duration-200 ease-in-out focus-within:bg-white/20">
            {hasValidApiKey ? (
              // Show key info when validated (no actual key)
              <div className="flex h-12 items-center px-3 text-white/80">
                <span className="text-sm">
                  🔑 {apiKeyType} key ({apiKeyLength} chars) - Valid
                </span>
              </div>
            ) : (
              // Show input when no valid key
              <div className="relative">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={handleApiKeyChange}
                  onKeyDown={handleKeyDown}
                  onBlur={() => setApiKeyTouched(true)}
                  placeholder="Enter your OpenAI API key..."
                  disabled={pending || isValidating}
                  className="h-12 w-full border-none bg-transparent pr-16 font-sans font-light text-white shadow-none ring-0 outline-none placeholder:text-white/50 focus:border-none focus:ring-0 focus:outline-none"
                  minLength={20}
                  aria-describedby="apiKey-error"
                />

                {/* Show/Hide API Key Toggle */}
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute top-1/2 right-8 -translate-y-1/2 text-white/50 hover:text-white/70"
                  tabIndex={-1}
                >
                  {showApiKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>

                {/* Validation Status Indicator */}
                <div
                  className={`absolute top-1/2 right-3 size-2.5 -translate-y-1/2 transform rounded-full transition-colors duration-300 ${
                    validationStatus === 'valid'
                      ? 'bg-green-400'
                      : validationStatus === 'validating'
                        ? 'animate-pulse bg-blue-400'
                        : validationStatus === 'error'
                          ? 'bg-red-400'
                          : 'animate-slow-pulse bg-yellow-300'
                  }`}
                />
              </div>
            )}
          </div>

          {/* Model Selector and Action Buttons */}
          <div className="flex h-12 items-center">
            <div className="flex h-full w-full rounded-lg rounded-tl-none rounded-tr-lg rounded-b-none bg-white/10 transition-colors duration-200 ease-in-out focus-within:bg-white/20 hover:bg-white/20">
              {/* Model Selector */}
              <div className="flex-grow [&>*]:bg-transparent [&>*]:focus-within:bg-transparent [&>*]:hover:bg-transparent [&>*]:focus:bg-transparent">
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  disabled={pending || isValidating}
                  className="h-full rounded-none border-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex h-full items-center gap-1 px-2">
                {!hasValidApiKey && apiKeyInput.trim() && (
                  // Validate Button
                  <Button
                    type="button"
                    onClick={handleApiKeyValidation}
                    disabled={isValidating || pending}
                    className="flex size-8 items-center justify-center rounded-lg border border-solid border-green-500/50 bg-green-500/20 p-0 text-green-300 hover:border-green-400 hover:bg-green-500/30"
                    title="Validate API Key"
                  >
                    {isValidating ? (
                      <div className="size-3 animate-spin rounded-full border border-green-300 border-t-transparent" />
                    ) : (
                      <span className="text-xs">✓</span>
                    )}
                  </Button>
                )}

                {hasValidApiKey && (
                  // Delete Button
                  <Button
                    type="button"
                    onClick={handleDeleteApiKey}
                    disabled={pending}
                    className="flex size-8 items-center justify-center rounded-lg border border-solid border-white/30 bg-transparent p-0 text-white/70 shadow-[rgba(0,0,0,0.3)_0px_2px_4px_0px] hover:border-red-400 hover:bg-red-500/20 hover:text-red-300"
                    title="Delete API Key"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* API Key Error Message */}
        {apiKeyError && apiKeyTouched && (
          <p id="apiKey-error" className="mt-1 text-center text-xs text-red-400">
            {apiKeyError}
          </p>
        )}

        {/* Validation Help Text */}
        {!hasValidApiKey && apiKeyInput.trim() && (
          <p className="mt-1 text-center text-xs text-blue-300">
            Press Enter or click ✓ to validate your API key
          </p>
        )}
      </div>
    </>
  );
}

// UPDATED Chat Input Form Component
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

        {/* Helper Text */}
        <p className="mb-1 text-center text-xs text-blue-200">
          Press Enter to send, Shift + Enter for new line
        </p>

        {/* Status Messages */}
        {!hasValidApiKey ? (
          <p className="animate-slow-pulse mb-1 text-center text-xs text-yellow-300">
            ⚠️ An OpenAI API key is required to use this assistant
          </p>
        ) : (
          <div className="h-5" />
        )}
      </form>
    </div>
  );
}
