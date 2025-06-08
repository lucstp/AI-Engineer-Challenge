import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useChat } from './use-chat';

global.fetch = vi.fn();

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useChat());
    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSending).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.apiKey).toBe('');
  });

  it('sets API key', () => {
    const { result } = renderHook(() => useChat());
    act(() => {
      result.current.setApiKey('abc');
    });
    expect(result.current.apiKey).toBe('abc');
  });

  it('prevents sending empty message', async () => {
    const { result } = renderHook(() => useChat());
    act(() => {
      result.current.setApiKey('test-key');
    });
    await act(async () => {
      await result.current.sendMessage('');
    });
    expect(result.current.error).toBe('Message cannot be empty');
  });

  it('prevents sending message without API key', async () => {
    const { result } = renderHook(() => useChat());
    await act(async () => {
      await result.current.sendMessage('Hello');
    });
    expect(result.current.error).toBe('API key is required');
  });

  it('adds optimistic message and sends user message (happy path)', async () => {
    const { result } = renderHook(() => useChat());
    act(() => {
      result.current.setApiKey('test-key');
    });
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Hi there!' }),
    } as Response);
    await act(async () => {
      await result.current.sendMessage('Hello!');
    });
    // Should have user and assistant messages
    expect(result.current.messages.some((m) => m.role === 'user')).toBe(true);
    expect(result.current.messages.some((m) => m.role === 'assistant')).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('handles API error response', async () => {
    const { result } = renderHook(() => useChat());
    act(() => {
      result.current.setApiKey('test-key');
    });
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: '', success: false, error: 'Server error' }),
    } as Response);
    await act(async () => {
      await result.current.sendMessage('fail');
    });
    expect(result.current.error).toBe('Server error');
  });

  it('clearMessages resets messages', () => {
    const { result } = renderHook(() => useChat());
    act(() => {
      result.current.setApiKey('test-key');
    });
    act(() => {
      result.current.addOptimisticMessage({ content: 'Test', role: 'user', isOptimistic: true });
    });
    expect(result.current.messages.length).toBeGreaterThan(0);
    act(() => {
      result.current.clearMessages();
    });
    expect(result.current.messages).toEqual([]);
  });

  it('regenerateResponse handles no user message edge case', async () => {
    const { result } = renderHook(() => useChat());
    await act(async () => {
      await result.current.regenerateResponse();
    });
    expect(result.current.error).toMatch(/No user message/);
  });

  it('addOptimisticMessage adds a message with isOptimistic', () => {
    const { result } = renderHook(() => useChat());
    act(() => {
      result.current.addOptimisticMessage({
        content: 'Optimistic',
        role: 'user',
        isOptimistic: true,
      });
    });
    expect(result.current.messages.some((m) => m.isOptimistic)).toBe(true);
  });
});
