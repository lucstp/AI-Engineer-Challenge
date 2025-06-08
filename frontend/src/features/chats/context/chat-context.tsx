// React 19 optimized context for sharing chat state across components
'use client';

import { createContext, Suspense, useContext, type ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { useChat } from '../hooks/use-chat';
import type { ChatContextType } from '../types/chat';

// Create context with proper TypeScript typing
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Loading fallback component for Suspense
function ChatLoadingFallback() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="text-muted-foreground animate-pulse">Loading chat...</div>
    </div>
  );
}

// Error boundary fallback for chat errors
import type { FallbackProps } from 'react-error-boundary';

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

// React 19 optimized provider with Suspense and error handling
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

// Custom hook to consume chat context with proper error handling
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

// Higher-order component for chat context requirement
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
