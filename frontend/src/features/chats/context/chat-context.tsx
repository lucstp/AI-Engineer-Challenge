// React 19 optimized context for sharing chat state across components
'use client';

import { createContext, Suspense, useContext, type ReactNode } from 'react';
// Error boundary fallback for chat errors
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';

import { useChat } from '../hooks/use-chat';
import type { ChatContextType } from '../types/chat';

// Create context with proper TypeScript typing
const ChatContext = createContext<ChatContextType | undefined>(undefined);

/**
 * Displays a loading indicator for the chat interface during suspense.
 *
 * Used as a fallback UI while chat data is being loaded.
 */
function ChatLoadingFallback() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="text-muted-foreground animate-pulse">Loading chat...</div>
    </div>
  );
}

/**
 * Renders a fallback UI for chat-related errors within an error boundary.
 *
 * Displays the error message and provides a button to retry by resetting the error boundary.
 *
 * @param error - The error object caught by the error boundary.
 * @param resetErrorBoundary - Function to reset the error boundary and retry rendering.
 */
function ChatErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="border-destructive/20 bg-destructive/5 flex flex-col items-center justify-center space-y-4 rounded-lg border p-6">
      <div className="text-destructive font-medium">Chat Error</div>
      <div className="text-muted-foreground text-center text-sm">
        {error.message || 'Something went wrong with the chat'}
      </div>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

// Props interface for the provider
interface ChatProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Provides chat state to descendant components with built-in loading and error handling.
 *
 * Wraps children in a context provider, error boundary, and suspense boundary to manage chat state, display loading indicators, and handle errors gracefully.
 *
 * @param children - React nodes that will have access to the chat context.
 * @param fallback - Optional React node to display while chat state is loading.
 */
export function ChatProvider({ children, fallback }: ChatProviderProps) {
  const chatState = useChat();

  return (
    <ChatContext.Provider value={chatState}>
      <ErrorBoundary FallbackComponent={ChatErrorFallback}>
        <Suspense fallback={fallback || <ChatLoadingFallback />}>{children}</Suspense>
      </ErrorBoundary>
    </ChatContext.Provider>
  );
}

/**
 * Retrieves the current chat context value.
 *
 * @returns The chat context provided by {@link ChatProvider}.
 *
 * @throws {Error} If called outside of a {@link ChatProvider}.
 */
export function useChatContext(): ChatContextType {
  const context = useContext(ChatContext);

  if (context === undefined) {
    throw new Error(
      'useChatContext must be used within a ChatProvider. ' +
        'Make sure to wrap your component with <ChatProvider>.',
    );
  }

  return context;
}

/**
 * Higher-order component that injects the chat context as a `chatContext` prop into the wrapped component.
 *
 * @param Component - The React component to wrap.
 * @returns A new component that provides the chat context to {@link Component} via the `chatContext` prop.
 *
 * @remark Throws an error if used outside a {@link ChatProvider}.
 */
export function withChatContext<P extends object>(Component: React.ComponentType<P>) {
  const WrappedComponent = (props: P) => {
    const chatContext = useChatContext();
    return <Component {...props} chatContext={chatContext} />;
  };

  WrappedComponent.displayName = `withChatContext(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Export context for advanced use cases (testing, etc.)
export { ChatContext };
