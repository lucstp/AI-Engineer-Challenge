import { describe, expect, it } from 'vitest';

import * as chatFeature from './index';

describe('chat feature barrel exports', () => {
  it('exports server components', () => {
    expect(chatFeature.MessageList).toBeDefined();
    expect(typeof chatFeature.MessageList).toBe('function');
  });

  it('exports client components', () => {
    expect(chatFeature.TypewriterMessage).toBeDefined();
    expect(chatFeature.AnimatedMessageContainer).toBeDefined();
    expect(chatFeature.MessageBubble).toBeDefined();
    expect(typeof chatFeature.TypewriterMessage).toBe('function');
    expect(typeof chatFeature.AnimatedMessageContainer).toBe('function');
    expect(typeof chatFeature.MessageBubble).toBe('function');
  });

  it('exports configuration constants', () => {
    expect(chatFeature.AVAILABLE_MODELS).toBeDefined();
    expect(chatFeature.DEFAULT_CHAT_CONFIG).toBeDefined();
    expect(Array.isArray(chatFeature.AVAILABLE_MODELS)).toBe(true);
    expect(typeof chatFeature.DEFAULT_CHAT_CONFIG).toBe('object');
  });

  it('exports model configuration correctly', () => {
    expect(chatFeature.AVAILABLE_MODELS.length).toBeGreaterThan(0);
    expect(chatFeature.AVAILABLE_MODELS[0]).toHaveProperty('id');
    expect(chatFeature.AVAILABLE_MODELS[0]).toHaveProperty('name');
  });

  it('exports default chat config with required properties', () => {
    const config = chatFeature.DEFAULT_CHAT_CONFIG;
    expect(config).toHaveProperty('maxMessageLength');
    expect(config).toHaveProperty('typingDelay');
    expect(config).toHaveProperty('animationSpeed');
    expect(config).toHaveProperty('apiKeyMinLength');
    expect(typeof config.maxMessageLength).toBe('number');
    expect(typeof config.typingDelay).toBe('number');
  });

  // Modern Architecture Notes:
  // - Server Components: MessageList, MessageBubble for static content
  // - Client Components: TypewriterMessage, AnimatedMessageContainer for interactions
  // - Global types imported from @/types for single source of truth
  // - Feature-specific types defined in chat.types.ts
  // - Configuration constants exported for reusability
});
