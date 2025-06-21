import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AnimatedBackground } from './animated-background';

// Test token generator to avoid reusing secret-like strings
const generateTestApiKey = (valid = true) => {
  const randomSuffix = Math.random().toString(36).substring(2, 15);
  return valid
    ? `test-valid-key-${randomSuffix}${'x'.repeat(20)}` // 48+ chars but clearly fake
    : `test-invalid-key-${randomSuffix}`;
};

// Mock the Zustand store
const mockUseChatStore = vi.fn();
vi.mock('@/store', () => ({
  useChatStore: () => mockUseChatStore(),
}));

// Helper function to setup store state (secure API structure)
const setupMockStore = (
  hasValidApiKey = false,
  apiKeyType: string | null = null,
  apiKeyLength: number | null = null,
) => {
  mockUseChatStore.mockReturnValue({
    hasValidApiKey,
    apiKeyType,
    apiKeyLength,
    isRehydrated: true, // Add missing isRehydrated property
    hasSeenWelcomeAnimation: false,
    hasCompletedInitialSetup: true, // Set to true to make isFirstTimeUser false for consistent blur
    // Include other required store properties
    messages: [],
    isInitialized: true,
    initializeStore: vi.fn(),
    checkSession: vi.fn(), // Add missing checkSession method
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
  });
};

describe('AnimatedBackground', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('renders children correctly', () => {
      setupMockStore();

      render(
        <AnimatedBackground>
          <div data-testid="test-child">Test Content</div>
        </AnimatedBackground>,
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    it('starts with invalid logo state by default', () => {
      setupMockStore();

      const { container } = render(
        <AnimatedBackground>
          <div>Content</div>
        </AnimatedBackground>,
      );

      // Gray logo should be visible (opacity-100), yellow logo hidden (opacity-0)
      const grayLogo = container.querySelector('[class*="aimakerspace-gray-192.png"]');
      const yellowLogo = container.querySelector('[class*="aimakerspace-i-192.png"]');

      expect(grayLogo).toHaveClass('opacity-100');
      expect(yellowLogo).toHaveClass('opacity-0');
    });
  });

  describe('API key state transitions', () => {
    it('shows valid state when API key is present and valid', async () => {
      setupMockStore(true, 'project', 51);

      const { container, rerender } = render(
        <AnimatedBackground>
          <div>Content</div>
        </AnimatedBackground>,
      );

      // Force re-render to trigger useEffect
      rerender(
        <AnimatedBackground>
          <div>Content</div>
        </AnimatedBackground>,
      );

      // After state update, yellow logo should be visible
      const yellowLogo = container.querySelector(
        '[class*="opacity-100"][class*="aimakerspace-i-192.png"]',
      );
      const grayLogo = container.querySelector(
        '[class*="opacity-0"][class*="aimakerspace-gray-192.png"]',
      );

      expect(yellowLogo).toBeInTheDocument();
      expect(grayLogo).toBeInTheDocument();
    });

    it('shows invalid state when API key is not valid', () => {
      setupMockStore(false, null, null);

      const { container } = render(
        <AnimatedBackground>
          <div>Content</div>
        </AnimatedBackground>,
      );

      const grayLogo = container.querySelector(
        '[class*="opacity-100"][class*="aimakerspace-gray-192.png"]',
      );
      expect(grayLogo).toBeInTheDocument();
    });

    it('shows invalid state when API key data is missing', () => {
      setupMockStore(false, null, null); // hasValidApiKey should be false when data is missing

      const { container } = render(
        <AnimatedBackground>
          <div>Content</div>
        </AnimatedBackground>,
      );

      const grayLogo = container.querySelector('[class*="aimakerspace-gray-192.png"]');
      expect(grayLogo).toHaveClass('opacity-100');
    });

    it('shows invalid state when only partial key info is available', () => {
      setupMockStore(false, 'project', null); // hasValidApiKey should be false when data is incomplete

      const { container } = render(
        <AnimatedBackground>
          <div>Content</div>
        </AnimatedBackground>,
      );

      const grayLogo = container.querySelector('[class*="aimakerspace-gray-192.png"]');
      expect(grayLogo).toHaveClass('opacity-100');
    });
  });

  describe('styling and layout', () => {
    it('applies correct CSS classes for layout structure', () => {
      setupMockStore();

      const { container } = render(
        <AnimatedBackground>
          <div>Content</div>
        </AnimatedBackground>,
      );

      // Main container should be fixed positioned
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('fixed', 'inset-0', 'min-h-screen');

      // Background should have gradient and scale transform
      const backgroundDiv = mainContainer.querySelector('[class*="bg-gradient-to-bl"]');
      expect(backgroundDiv).toHaveClass('[transform:scale(2.5)]');

      // Content wrapper should have relative positioning and z-index
      const contentWrapper = mainContainer.querySelector('[class*="relative"][class*="z-10"]');
      expect(contentWrapper).toBeInTheDocument();
    });

    it('includes glassmorphism backdrop blur effect', () => {
      setupMockStore();

      const { container } = render(
        <AnimatedBackground>
          <div>Content</div>
        </AnimatedBackground>,
      );

      const backdropElement = container.querySelector('[class*="backdrop-blur-"]');
      expect(backdropElement).toHaveClass('backdrop-blur-[1.5px]');
    });

    it('applies transition classes for smooth animations', () => {
      setupMockStore();

      const { container } = render(
        <AnimatedBackground>
          <div>Content</div>
        </AnimatedBackground>,
      );

      const grayLogo = container.querySelector('[class*="aimakerspace-gray-192.png"]');
      const yellowLogo = container.querySelector('[class*="aimakerspace-i-192.png"]');

      expect(grayLogo).toHaveClass('transition-opacity', 'duration-300', 'ease-in-out');
      expect(yellowLogo).toHaveClass('transition-opacity', 'duration-300', 'ease-in-out');
    });
  });

  describe('logo patterns', () => {
    it('uses correct background image URLs for logos', () => {
      setupMockStore();

      const { container } = render(
        <AnimatedBackground>
          <div>Content</div>
        </AnimatedBackground>,
      );

      const grayLogo = container.querySelector('[class*="aimakerspace-gray-192.png"]');
      const yellowLogo = container.querySelector('[class*="aimakerspace-i-192.png"]');

      expect(grayLogo).toHaveClass('bg-[url(/assets/logos/aimakerspace-gray-192.png)]');
      expect(yellowLogo).toHaveClass('bg-[url(/assets/logos/aimakerspace-i-192.png)]');
    });

    it('applies correct background sizing and positioning', () => {
      setupMockStore();

      const { container } = render(
        <AnimatedBackground>
          <div>Content</div>
        </AnimatedBackground>,
      );

      const grayLogo = container.querySelector('[class*="aimakerspace-gray-192.png"]');
      const yellowLogo = container.querySelector('[class*="aimakerspace-i-192.png"]');

      for (const logo of [grayLogo, yellowLogo]) {
        expect(logo).toHaveClass('bg-[length:192px_192px]', 'bg-center', 'bg-repeat');
      }
    });
  });

  describe('accessibility and performance', () => {
    it('does not interfere with content accessibility', () => {
      setupMockStore();

      render(
        <AnimatedBackground>
          <button type="button">Accessible Button</button>
          <input aria-label="Test Input" />
        </AnimatedBackground>,
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByLabelText('Test Input')).toBeInTheDocument();
    });

    it('provides proper stacking context with z-index', () => {
      setupMockStore();

      const { container } = render(
        <AnimatedBackground>
          <div data-testid="content">Interactive Content</div>
        </AnimatedBackground>,
      );

      const contentWrapper = container.querySelector('[class*="z-10"]');
      const content = screen.getByTestId('content');

      expect(contentWrapper).toContainElement(content);
    });
  });

  describe('edge cases', () => {
    it('handles store state updates gracefully', () => {
      setupMockStore();

      const { rerender } = render(
        <AnimatedBackground>
          <div>Content</div>
        </AnimatedBackground>,
      );

      // Should not throw when store state changes
      expect(() => {
        setupMockStore(true, 'project', 51);
        rerender(
          <AnimatedBackground>
            <div>Updated Content</div>
          </AnimatedBackground>,
        );
      }).not.toThrow();
    });

    it('handles missing children gracefully', () => {
      setupMockStore();

      expect(() => {
        render(<AnimatedBackground>{null}</AnimatedBackground>);
      }).not.toThrow();
    });
  });
});
