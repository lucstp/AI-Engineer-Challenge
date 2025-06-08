import { describe, expect, it } from 'vitest';

import type {
  ChatApiResponse,
  ChatContextType,
  ChatState,
  Message,
  OptimisticMessage,
} from './chat';

describe('chat types', () => {
  it('Message type allows user and assistant roles', () => {
    const userMsg: Message = {
      id: '1',
      role: 'user',
      content: 'hi',
      timestamp: new Date().toISOString(),
    };
    const assistantMsg: Message = {
      id: '2',
      role: 'assistant',
      content: 'hello',
      timestamp: new Date().toISOString(),
      showTimestamp: true,
      isOptimistic: true,
    };
    expect(userMsg.role).toBe('user');
    expect(assistantMsg.role).toBe('assistant');
  });

  it('ChatState type supports error and apiKey', () => {
    const state: ChatState = {
      messages: [],
      isLoading: false,
      isSending: false,
      error: 'err',
      apiKey: 'key',
    };
    expect(state.error).toBe('err');
    expect(state.apiKey).toBe('key');
  });

  it('OptimisticMessage omits id/timestamp and requires isOptimistic', () => {
    const optimistic: OptimisticMessage = {
      content: 'pending',
      role: 'user',
      isOptimistic: true,
    };
    expect(optimistic.isOptimistic).toBe(true);
  });

  it('ChatApiResponse can represent success or error', () => {
    const ok: ChatApiResponse = { message: 'ok', success: true };
    const err: ChatApiResponse = { message: '', error: 'fail' };
    expect(ok.success).toBe(true);
    expect(err.error).toBe('fail');
  });

  it('ChatContextType defines context interface structure', () => {
    const mockContext: ChatContextType = {
      messages: [],
      isLoading: false,
      isSending: false,
      error: null,
      apiKey: 'test-key',
      sendMessage: () => Promise.resolve(),
      clearMessages: () => {},
      setApiKey: () => {},
      regenerateResponse: () => Promise.resolve(),
      addOptimisticMessage: () => {},
    };
    expect(mockContext.messages).toEqual([]);
    expect(typeof mockContext.sendMessage).toBe('function');
  });
});
