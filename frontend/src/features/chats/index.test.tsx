import { describe, expect, it } from 'vitest';

import * as chatIndex from './index';

describe('chats/index barrel exports', () => {
  it('exports useChat', () => {
    expect(typeof chatIndex.useChat).toBe('function');
  });
  it('exports ChatProvider, useChatContext, withChatContext, ChatContext', () => {
    expect(typeof chatIndex.ChatProvider).toBe('function');
    expect(typeof chatIndex.useChatContext).toBe('function');
    expect(typeof chatIndex.withChatContext).toBe('function');
    expect(chatIndex.ChatContext).toBeDefined();
  });
  // Types are not available at runtime, so we do not test them here.
});
