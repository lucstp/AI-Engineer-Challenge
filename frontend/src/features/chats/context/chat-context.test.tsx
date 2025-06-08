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
    // Create a component that suspends by throwing a promise
    const SuspendingConsumer = () => {
      const promise = new Promise(() => {}); // Never resolves, keeps suspending
      throw promise;
    };

    const SuspenseFallback = <div data-testid="loading">Loading chat...</div>;

    render(
      <ChatProvider fallback={SuspenseFallback}>
        <SuspendingConsumer />
      </ChatProvider>,
    );

    // The ChatProvider's fallback should be rendered
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders error boundary fallback on error', () => {
    // Suppress error boundary logs
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Import the mocked module and temporarily override useChat
    const { useChat } = vi.mocked(require('../hooks/use-chat'));
    const originalImplementation = useChat.getMockImplementation();

    useChat.mockImplementation(() => {
      throw new Error('Test error');
    });

    function ErrorConsumer() {
      useChatContext();
      return null;
    }

    // Expect the error boundary to catch the error
    expect(() => {
      render(
        <ChatProvider>
          <ErrorConsumer />
        </ChatProvider>,
      );
    }).toThrow('Test error');

    // Restore the original mock implementation and console
    if (originalImplementation) {
      useChat.mockImplementation(originalImplementation);
    } else {
      useChat.mockRestore();
    }
    spy.mockRestore();
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
