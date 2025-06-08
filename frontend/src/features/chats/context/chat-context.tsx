// React 19 optimized context for sharing chat state across components
'use client'

import { createContext, type ReactNode, useContext, Suspense } from 'react'
import { useChat, type ChatContextType } from '../index'

// Create context with proper TypeScript typing
const ChatContext = createContext<ChatContextType | undefined>(undefined)

// Loading fallback component for Suspense
function ChatLoadingFallback() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-pulse text-muted-foreground">
        Loading chat...
      </div>
    </div>
  )
}

// Error boundary fallback for chat errors
interface ChatErrorFallbackProps {
  error: Error
  resetError: () => void
}

function ChatErrorFallback({ error, resetError }: ChatErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4 border border-destructive/20 rounded-lg bg-destructive/5">
      <div className="text-destructive font-medium">
        Chat Error
      </div>
      <div className="text-sm text-muted-foreground text-center">
        {error.message || 'Something went wrong with the chat'}
      </div>
      <button
        type="button"
        onClick={resetError}
        className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}

// Props interface for the provider
interface ChatProviderProps {
  children: ReactNode
  fallback?: ReactNode
}

// React 19 optimized provider with Suspense and error handling
export function ChatProvider({ children, fallback }: ChatProviderProps) {
  const chatState = useChat()

  return (
    <ChatContext.Provider value={chatState}>
      <Suspense fallback={fallback || <ChatLoadingFallback />}>
        {children}
      </Suspense>
    </ChatContext.Provider>
  )
}

// Custom hook to consume chat context with proper error handling
export function useChatContext(): ChatContextType {
  const context = useContext(ChatContext)

  if (context === undefined) {
    throw new Error(
      'useChatContext must be used within a ChatProvider. ' +
      'Make sure to wrap your component with <ChatProvider>.'
    )
  }

  return context
}

// Higher-order component for chat context requirement
export function withChatContext<P extends object>(
  Component: React.ComponentType<P>
) {
  const WrappedComponent = (props: P) => {
    const chatContext = useChatContext()
    return <Component {...props} chatContext={chatContext} />
  }

  WrappedComponent.displayName = `withChatContext(${Component.displayName || Component.name})`
  return WrappedComponent
}

// Export context for advanced use cases (testing, etc.)
export { ChatContext }
