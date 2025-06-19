'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Button, Input, Textarea } from '@/components/ui';
import { sendMessageAction, type FormState } from '@/app/actions/chat-actions';
import { useChatStore } from '@/store';
import { Send, Trash2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { useDebounceCallback } from 'usehooks-ts';

import { ModelSelector } from './model-selector';

// Submit button component using useFormStatus
function SubmitButton() {
  const { pending } = useFormStatus();
  const { isApiKeyValid } = useChatStore();

  return (
    <Button
      type="submit"
      disabled={pending || !isApiKeyValid}
      className={`flex size-8 items-center justify-center rounded-lg border border-solid border-white/30 bg-transparent p-0 text-white/70 shadow-[rgba(0,0,0,0.3)_0px_2px_4px_0px] disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-white/30 disabled:hover:bg-transparent ${
        !pending && isApiKeyValid
          ? 'hover:border-white/40 hover:bg-white/20'
          : 'hover:bg-transparent'
      }`}
    >
      <Send className="size-4" />
    </Button>
  );
}

// API Key section component
function ApiKeySection() {
  const [apiKeyTouched, setApiKeyTouched] = useState(false);
  const { pending } = useFormStatus();

  const {
    apiKey,
    selectedModel,
    apiKeyError,
    setApiKey,
    setSelectedModel,
    deleteApiKey,
    setIsExpanded,
    isApiKeyValid,
  } = useChatStore();

  // Debounced API key validation to avoid excessive re-renders
  const debounceApiKeyChange = useDebounceCallback((key: string) => {
    setApiKey(key);
  }, 300);

  // Handle API key input changes
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debounceApiKeyChange(value);
    setApiKeyTouched(true);
  };

  // Handle chat expansion based on API key validity
  useEffect(() => {
    setIsExpanded(isApiKeyValid);
  }, [isApiKeyValid, setIsExpanded]);

  // Handle deleting API key
  const handleDeleteApiKey = () => {
    deleteApiKey();
    setApiKeyTouched(false);
  };

  return (
    <>
      {/* API Key and Model Selector Row */}
      <div className="mb-1.5 rounded-t-xl">
        <div className="flex flex-col items-stretch gap-y-2 sm:flex-row sm:items-center sm:gap-x-1">
          {/* API Key Input */}
          <div className="relative flex-1 rounded-lg rounded-tl-lg rounded-r-none rounded-b-none bg-white/10 transition-colors duration-200 ease-in-out focus-within:bg-white/20">
            <Input
              type={apiKey.trim() ? 'password' : 'text'}
              name="apiKey"
              value={apiKey}
              onChange={handleApiKeyChange}
              onBlur={() => setApiKeyTouched(true)}
              placeholder="Enter your OpenAI API key..."
              disabled={pending}
              className="h-12 w-full border-none bg-transparent pr-8 font-sans font-light text-white shadow-none ring-0 outline-none placeholder:text-white/50 focus:border-none focus:ring-0 focus:outline-none"
              required
              minLength={20}
              aria-describedby="apiKey-error"
            />
            <div
              className={`absolute top-1/2 right-3 size-2.5 -translate-y-1/2 transform rounded-full transition-colors duration-300 ${
                !apiKeyError && apiKey.trim() ? 'bg-green-400' : 'animate-slow-pulse bg-yellow-300'
              }`}
            />
          </div>

          {/* Model Selector and Delete Button */}
          <div className="flex h-12 items-center">
            <div className="flex h-full w-full items-center rounded-lg rounded-tl-none rounded-tr-lg rounded-b-none bg-white/10 transition-colors duration-200 ease-in-out focus-within:bg-white/20 hover:bg-white/20">
              <div className="flex flex-grow items-center [&>*]:bg-transparent [&>*]:focus-within:bg-transparent [&>*]:hover:bg-transparent [&>*]:focus:bg-transparent">
                <input type="hidden" name="model" value={selectedModel} />
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  disabled={pending}
                  className="h-12 rounded-none border-none"
                />
              </div>

              <div className="flex h-full items-center px-2">
                <Button
                  type="button"
                  onClick={handleDeleteApiKey}
                  disabled={!apiKey.trim() || pending}
                  className={`flex size-8 items-center justify-center rounded-lg border border-solid border-white/30 bg-transparent p-0 text-white/70 shadow-[rgba(0,0,0,0.3)_0px_2px_4px_0px] disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-white/30 disabled:hover:bg-transparent ${
                    apiKey.trim() && !pending
                      ? 'hover:border-white/40 hover:bg-white/20'
                      : 'cursor-not-allowed text-white/30 opacity-50'
                  }`}
                  title="Delete API Key"
                  tabIndex={0}
                >
                  <Trash2 className="size-4" />
                </Button>
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
      </div>
    </>
  );
}

// Main chat input form component
export function ChatInput() {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isLoading, isApiKeyValid } = useChatStore();

  // Initial form state matching our Server Action
  const initialState: FormState = {
    message: '',
    success: false,
  };

  const [state, formAction] = useActionState(sendMessageAction, initialState);

  // Auto-focus textarea when API key is valid
  useEffect(() => {
    if (!isLoading && isApiKeyValid) {
      textareaRef.current?.focus();
    }
  }, [isLoading, isApiKeyValid]);

  // Auto-resize textarea based on content
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

  // Handle Enter key press for form submission
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      // Submit the form programmatically
      const form = e.currentTarget.closest('form');
      if (form) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }
    }
  };

  // Clear input on successful submission
  useEffect(() => {
    if (state?.success) {
      setInput('');
      textareaRef.current?.focus();
    }
  }, [state?.success]);

  return (
    <div className="mt-auto pt-4">
      <form action={formAction} className="space-y-0">
        {/* Hidden developer message field */}
        <input type="hidden" name="developerMessage" value="You are a helpful AI assistant." />

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
              disabled={!isApiKeyValid}
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

        {/* Form Error Messages */}
        {state?.errors?.message && (
          <p id="message-error" className="text-center text-xs text-red-400">
            {state.errors.message[0]}
          </p>
        )}

        {state?.errors?.apiKey && (
          <p className="text-center text-xs text-red-400">{state.errors.apiKey[0]}</p>
        )}

        {/* General error message */}
        {!state?.success && state?.message && (
          <p className="text-center text-xs text-red-400">{state.message}</p>
        )}

        {/* Helper Text */}
        <p className="mb-1 text-center text-xs text-blue-200">
          Press Enter to send, Shift + Enter for new line
        </p>

        {/* Status Messages */}
        {!isApiKeyValid ? (
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
