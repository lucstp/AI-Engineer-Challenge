import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatProvider, useChatContext, withChatContext } from './chat-context';

// Mock useChat to control state and actions
vi.mock('../hooks/use-chat', () => ({
  useChat: () => ({
    messages: [
      { id: '1', role: 'user', content: 'Hi', timestamp: '2024-01-01T00:00:00Z' },
      { id: '2', role: 'assistant', content: 'Hello!', timestamp: '2024-01-01T00:00:01Z' },
    ],
    isLoading: false,
    isSending: false,
    error: null,
    apiKey: 'test',
    setApiKey: vi.fn(),
    sendMessage: vi.fn(),
    clearMessages: vi.fn(),
    regenerateResponse: vi.fn(),
    addOptimisticMessage: vi.fn(),
  }),
}));

function Consumer() {
  const ctx = useChatContext();
  return (
    <div>
      <div data-testid="messages-count">{ctx.messages.length}</div>
      <div data-testid="api-key">{ctx.apiKey}</div>
    </div>
  );
}

describe('ChatProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('provides chat context to children', () => {
    render(
      <ChatProvider>
        <Consumer />
      </ChatProvider>,
    );
    expect(screen.getByTestId('messages-count').textContent).toBe('2');
    expect(screen.getByTestId('api-key').textContent).toBe('test');
  });

  it('throws if useChatContext is used outside provider', () => {
    // Suppress error boundary logs
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    function BadConsumer() {
      useChatContext();
      return null;
    }
    expect(() => {
      act(() => {
        render(<BadConsumer />);
      });
    }).toThrow(/useChatContext must be used within a ChatProvider/);
    spy.mockRestore();
  });

  it('renders fallback during suspense', async () => {
    // Simulate Suspense fallback
    const SuspenseFallback = <div data-testid="loading">Loading chat...</div>;
    render(
      <ChatProvider fallback={SuspenseFallback}>
        <React.Suspense fallback={null}>
          <Consumer />
        </React.Suspense>
      </ChatProvider>,
    );
    // The fallback should be present (simulate loading state if needed)
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders error boundary fallback on error', async () => {
    // Mock useChat to throw
    vi.doMock('../hooks/use-chat', () => ({
      useChat: () => {
        throw new Error('Test error');
      },
    }));
    // ErrorBoundary fallback is rendered
    function ErrorConsumer() {
      useChatContext();
      return null;
    }
    render(
      <ChatProvider>
        <ErrorConsumer />
      </ChatProvider>,
    );
    expect(await screen.findByText(/Chat Error/)).toBeInTheDocument();
    expect(await screen.findByText(/Test error/)).toBeInTheDocument();
  });

  it('withChatContext HOC injects chatContext prop', () => {
    // HOC: Dummy does NOT declare chatContext in its props
    const Dummy = (props: { [key: string]: unknown }) => (
      <div data-testid="hoc-messages">
        {
          (props as { chatContext: import('../types/chat').ChatContextType }).chatContext.messages
            .length
        }
      </div>
    );
    // Type assertion to satisfy TypeScript and linter
    const Wrapped = withChatContext(Dummy as React.ComponentType<unknown>);
    render(
      <ChatProvider>
        <Wrapped />
      </ChatProvider>,
    );
    expect(screen.getByTestId('hoc-messages').textContent).toBe('2');
  });
});
