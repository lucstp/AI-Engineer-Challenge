import * as store from '@/store';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import HomePage from './page';

// Mock Zustand store with secure API structure
const mockStore = {
  messages: [{ id: '1', content: 'Hello', role: 'user', timestamp: new Date().toISOString() }],
  isInitialized: true,
  initializeStore: vi.fn(),
  checkSession: vi.fn(), // Add missing checkSession method
  hasValidApiKey: true,
  apiKeyType: 'project',
  apiKeyLength: 51,
  apiKeyError: null,
  setMessages: vi.fn(),
  addMessage: vi.fn(),
  updateMessage: vi.fn(),
  clearMessages: vi.fn(),
  setApiKey: vi.fn(),
  deleteApiKey: vi.fn(),
  selectedModel: 'gpt-4o-mini',
  setSelectedModel: vi.fn(),
  isLoading: false,
  setIsLoading: vi.fn(),
  isTyping: false,
  setIsTyping: vi.fn(),
  showTimestamps: false,
  setShowTimestamps: vi.fn(),
  isAnimating: false,
  setIsAnimating: vi.fn(),
  animatedContent: '',
  setAnimatedContent: vi.fn(),
  isExpanded: false,
  setIsExpanded: vi.fn(),
  reset: vi.fn(),
};

describe('HomePage Integration', () => {
  let useChatStoreSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Create a single spy instance and store it for reuse
    useChatStoreSpy = vi.spyOn(store, 'useChatStore').mockImplementation(() => mockStore);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders ChatLayout, ChatShell, and chat interface', () => {
    render(<HomePage />);
    // Header
    expect(screen.getByText('AI Chat Assistant')).toBeInTheDocument();
    // Check for chat components
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('initializes store on mount', () => {
    const initializeStoreSpy = vi.fn();
    useChatStoreSpy.mockImplementation(() => ({
      ...mockStore,
      isInitialized: false,
      initializeStore: initializeStoreSpy,
    }));

    render(<HomePage />);
    expect(initializeStoreSpy).toHaveBeenCalled();
  });

  it('renders timestamp toggle button', () => {
    render(<HomePage />);
    expect(screen.getByText('Show Times')).toBeInTheDocument();
  });

  it('toggles timestamp display', () => {
    const setShowTimestampsSpy = vi.fn();
    useChatStoreSpy.mockImplementation(() => ({
      ...mockStore,
      showTimestamps: false,
      setShowTimestamps: setShowTimestampsSpy,
    }));

    render(<HomePage />);
    const toggleButton = screen.getByText('Show Times');
    toggleButton.click();
    expect(setShowTimestampsSpy).toHaveBeenCalled();
  });
});
