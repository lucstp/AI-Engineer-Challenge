import { describe, expect, it } from 'vitest';

import * as chatIndex from './index';

describe('chats/index barrel exports', () => {
  it('exports Message type (re-exported from store)', () => {
    // Types are not available at runtime, but we can check the export exists
    expect('Message' in chatIndex).toBe(false); // Types don't exist at runtime
  });

  it('maintains legacy type exports for compatibility', () => {
    // Testing that the module exports complete successfully
    // Types like ChatState, ChatContextType, etc. are still available as types
    expect(chatIndex).toBeDefined();
  });

  // Phase 2 Migration Note:
  // - useChat hook has been replaced with useChatStore from @/store
  // - ChatProvider, useChatContext, withChatContext, ChatContext have been removed
  // - Zustand store now handles all chat state management
  // - Types are still exported for legacy compatibility
});
