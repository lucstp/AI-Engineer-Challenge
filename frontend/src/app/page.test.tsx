import * as store from '@/store';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import HomePage from './page';

// Mock Zustand store
const mockStore = {
  messages: [{ id: 1, text: 'Hello' }],
  isInitialized: true,
  initializeStore: vi.fn(),
  apiKey: 'test-key',
  isApiKeyValid: true,
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

  it('renders ChatLayout, ChatShell, and ChatDemo', () => {
    render(<HomePage />);
    // Header
    expect(screen.getByText('AI Chat Application')).toBeInTheDocument();
    // Footer
    expect(screen.getByText(/Enterprise Architecture/)).toBeInTheDocument();
    // ChatShell content
    expect(screen.getByText('Chat Store Status')).toBeInTheDocument();
    expect(screen.getByText('Phase 2 Complete ✅')).toBeInTheDocument();
  });

  it('displays Zustand store values', () => {
    render(<HomePage />);
    expect(screen.getByText(/Initialized:\s*✅/)).toBeInTheDocument();
    expect(screen.getByText(/API Key:\s*✅ Set/)).toBeInTheDocument();
    expect(screen.getByText(/API Key Valid:\s*✅/)).toBeInTheDocument();
    expect(screen.getByText('Messages: 1')).toBeInTheDocument();
  });

  it('renders not initialized state', () => {
    // Update the existing spy's behavior instead of creating a new spy
    useChatStoreSpy.mockImplementation(() => ({
      ...mockStore,
      isInitialized: false,
    }));
    render(<HomePage />);
    expect(screen.getByText(/Initialized:\s*❌/)).toBeInTheDocument();
  });

  it('renders API Key not set and invalid state', () => {
    // Update the existing spy's behavior instead of creating a new spy
    useChatStoreSpy.mockImplementation(() => ({
      ...mockStore,
      apiKey: '',
      isApiKeyValid: false,
    }));
    render(<HomePage />);
    expect(screen.getByText(/API Key:\s*❌ Not set/)).toBeInTheDocument();
    expect(screen.getByText(/API Key Valid:\s*❌/)).toBeInTheDocument();
  });
});
