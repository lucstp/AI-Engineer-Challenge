import { describe, expect, it } from 'vitest';

import {
  AVAILABLE_MODELS,
  DEFAULT_CHAT_CONFIG,
  type ChatConfig,
  type ChatInputProps,
  type Message,
  type MessageBubbleProps,
  type MessageListProps,
  type ModelOption,
} from './chat.types';

describe('modern chat types', () => {
  it('re-exports core types from global types system', () => {
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
      animated: true,
    };
    expect(userMsg.role).toBe('user');
    expect(assistantMsg.role).toBe('assistant');
    expect(assistantMsg.animated).toBe(true);
  });

  it('defines proper component prop interfaces', () => {
    // TypewriterMessageProps (4 props) is now kept inline in the component
    // following TypeScript organization rules for simple interfaces

    // Test that we can create a Message that works with TypewriterMessage
    const message: Message = {
      id: '1',
      content: 'test',
      role: 'assistant',
      timestamp: new Date().toISOString(),
      animated: true,
    };

    expect(message.animated).toBe(true);
    expect(message.role).toBe('assistant');
  });

  it('defines MessageBubbleProps with proper structure', () => {
    const bubbleProps: MessageBubbleProps = {
      message: {
        id: '1',
        content: 'test',
        role: 'user',
        timestamp: new Date().toISOString(),
      },
      showAvatar: true,
      isAnimating: false,
    };

    expect(bubbleProps.showAvatar).toBe(true);
    expect(bubbleProps.isAnimating).toBe(false);
  });

  it('defines MessageListProps for server component', () => {
    const listProps: MessageListProps = {
      messages: [],
      isLoading: false,
      isTyping: true,
      isAnimating: false,
    };

    expect(Array.isArray(listProps.messages)).toBe(true);
    expect(listProps.isTyping).toBe(true);
  });

  it('defines ChatInputProps for upcoming client component', () => {
    const inputProps: ChatInputProps = {
      apiKey: 'test-key',
      onApiKeyChange: () => {},
      selectedModel: 'gpt-4.1-mini',
      onModelChange: () => {},
      onSend: async () => {},
      isLoading: false,
      onDeleteApiKey: () => {},
    };

    expect(inputProps.selectedModel).toBe('gpt-4.1-mini');
    expect(typeof inputProps.onSend).toBe('function');
  });

  it('exports AVAILABLE_MODELS configuration', () => {
    expect(Array.isArray(AVAILABLE_MODELS)).toBe(true);
    expect(AVAILABLE_MODELS.length).toBeGreaterThan(0);

    const firstModel = AVAILABLE_MODELS[0];
    expect(firstModel).toHaveProperty('id');
    expect(firstModel).toHaveProperty('name');
    expect(typeof firstModel.id).toBe('string');
    expect(typeof firstModel.name).toBe('string');
  });

  it('exports DEFAULT_CHAT_CONFIG with proper values', () => {
    expect(typeof DEFAULT_CHAT_CONFIG).toBe('object');
    expect(DEFAULT_CHAT_CONFIG).toHaveProperty('maxMessageLength');
    expect(DEFAULT_CHAT_CONFIG).toHaveProperty('typingDelay');
    expect(DEFAULT_CHAT_CONFIG).toHaveProperty('animationSpeed');
    expect(DEFAULT_CHAT_CONFIG).toHaveProperty('apiKeyMinLength');

    expect(typeof DEFAULT_CHAT_CONFIG.maxMessageLength).toBe('number');
    expect(DEFAULT_CHAT_CONFIG.maxMessageLength).toBeGreaterThan(0);
    expect(DEFAULT_CHAT_CONFIG.typingDelay).toBeGreaterThanOrEqual(0);
  });

  it('defines ModelOption interface correctly', () => {
    const model: ModelOption = {
      id: 'test-model',
      name: 'Test Model',
      description: 'A test model',
    };

    expect(model.id).toBe('test-model');
    expect(model.name).toBe('Test Model');
    expect(model.description).toBe('A test model');
  });

  it('defines ChatConfig interface with required properties', () => {
    const config: ChatConfig = {
      maxMessageLength: 5000,
      typingDelay: 50,
      animationSpeed: 15,
      apiKeyMinLength: 30,
    };

    expect(config.maxMessageLength).toBe(5000);
    expect(config.apiKeyMinLength).toBe(30);
  });

  // Modern Type System Notes:
  // - Global types (Message, etc.) imported from @/types for single source of truth
  // - Component prop interfaces defined for type safety
  // - Configuration types and constants for feature customization
  // - Zero duplication with global type system
  // - Clear separation between global and feature-specific types
});
