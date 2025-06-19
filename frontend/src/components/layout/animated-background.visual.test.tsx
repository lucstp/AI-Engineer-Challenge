import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AnimatedBackground } from './animated-background';

// Test token generator to avoid reusing secret-like strings
const generateTestApiKey = (valid = true) => {
  const randomSuffix = Math.random().toString(36).substring(2, 15);
  return valid
    ? `test-valid-key-${randomSuffix}${'x'.repeat(20)}` // 48+ chars but clearly fake
    : `test-invalid-key-${randomSuffix}`;
};

// Mock the store for consistent visual testing
const mockUseChatStore = vi.fn();
vi.mock('@/store', () => ({
  useChatStore: () => mockUseChatStore(),
}));

// Helper function to setup secure store state
const setupSecureMockStore = (
  hasValidApiKey = false,
  apiKeyType: string | null = null,
  apiKeyLength: number | null = null,
) => {
  mockUseChatStore.mockReturnValue({
    hasValidApiKey,
    apiKeyType,
    apiKeyLength,
    // Include other required store properties
    messages: [],
    isInitialized: true,
    initializeStore: vi.fn(),
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

describe('AnimatedBackground Visual Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CSS class application', () => {
    it('applies correct Tailwind classes for invalid state', () => {
      setupSecureMockStore(false, null, null);

      const { container } = render(
        <AnimatedBackground>
          <div>Content</div>
        </AnimatedBackground>,
      );

      // Main container classes
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('fixed', 'inset-0', 'min-h-screen');

      // Background gradient classes
      const gradientBg = container.querySelector('[class*="bg-gradient-to-bl"]');
      expect(gradientBg).toHaveClass(
        'absolute',
        'inset-0',
        'origin-center',
        '[transform:scale(2.5)]',
        'bg-gradient-to-bl',
        'from-[#0f172a]',
        'via-[#1e1a78]',
        'to-[#0f172a]',
      );

      // Gray logo should be visible
      const grayLogo = container.querySelector('[class*="aimakerspace-gray-192.png"]');
      expect(grayLogo).toHaveClass(
        'absolute',
        'inset-0',
        'bg-[url(/assets/logos/aimakerspace-gray-192.png)]',
        'bg-[length:192px_192px]',
        'bg-center',
        'bg-repeat',
        'transition-opacity',
        'duration-300',
        'ease-in-out',
        'opacity-100',
      );

      // Yellow logo should be hidden
      const yellowLogo = container.querySelector('[class*="aimakerspace-i-192.png"]');
      expect(yellowLogo).toHaveClass('opacity-0');
    });

    it('applies correct Tailwind classes for valid state', () => {
      setupSecureMockStore(true, 'project', 51);

      const { container, rerender } = render(
        <AnimatedBackground>
          <div>Content</div>
        </AnimatedBackground>,
      );

      // Force re-render to trigger state change
      rerender(
        <AnimatedBackground>
          <div>Content</div>
        </AnimatedBackground>,
      );

      // Yellow logo should be visible
      const yellowLogo = container.querySelector(
        '[class*="opacity-100"][class*="aimakerspace-i-192.png"]',
      );
      expect(yellowLogo).toHaveClass(
        'absolute',
        'inset-0',
        'bg-[url(/assets/logos/aimakerspace-i-192.png)]',
        'bg-[length:192px_192px]',
        'bg-center',
        'bg-repeat',
        'transition-opacity',
        'duration-300',
        'ease-in-out',
        'opacity-100',
      );

      // Gray logo should be hidden
      const grayLogo = container.querySelector(
        '[class*="opacity-0"][class*="aimakerspace-gray-192.png"]',
      );
      expect(grayLogo).toHaveClass('opacity-0');
    });

    it('applies glassmorphism backdrop blur correctly', () => {
      setupSecureMockStore(false, null, null);

      const { container } = render(
        <AnimatedBackground>
          <div>Content</div>
        </AnimatedBackground>,
      );

      const backdropElement = container.querySelector('[class*="backdrop-blur-"]');
      expect(backdropElement).toHaveClass('absolute', 'inset-0', 'backdrop-blur-[2px]');
    });

    it('applies proper z-index layering', () => {
      setupSecureMockStore(false, null, null);

      const { container } = render(
        <AnimatedBackground>
          <div data-testid="content">Content</div>
        </AnimatedBackground>,
      );

      // Content should be on top layer
      const contentWrapper = container.querySelector('[class*="relative"][class*="z-10"]');
      expect(contentWrapper).toHaveClass('relative', 'z-10');

      // Background elements should be behind
      const backgroundElements = container.querySelectorAll(
        '[class*="absolute"][class*="inset-0"]',
      );
      expect(backgroundElements.length).toBeGreaterThan(0);
    });
  });

  describe('responsive design compliance', () => {
    it('uses fixed positioning for full-screen coverage', () => {
      setupSecureMockStore(false, null, null);

      const { container } = render(
        <AnimatedBackground>
          <div>Content</div>
        </AnimatedBackground>,
      );

      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('fixed', 'inset-0');

      // Verify class-based positioning (jsdom compatible)
      expect(mainContainer.className).toMatch(/fixed/);
      expect(mainContainer.className).toMatch(/inset-0/);
    });

    it('maintains minimum height for content coverage', () => {
      setupSecureMockStore(false, null, null);

      const { container } = render(
        <AnimatedBackground>
          <div>Content</div>
        </AnimatedBackground>,
      );

      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('min-h-screen');
    });
  });

  describe('animation and transition classes', () => {
    it('applies correct CSS transition properties', () => {
      setupSecureMockStore(false, null, null);

      const { container } = render(
        <AnimatedBackground>
          <div>Content</div>
        </AnimatedBackground>,
      );

      const logoElements = container.querySelectorAll('[class*="transition-opacity"]');

      for (const logo of logoElements) {
        expect(logo).toHaveClass('transition-opacity', 'duration-300', 'ease-in-out');
      }
    });

    it('follows animation patterns rule - no conflicting CSS animations', () => {
      setupSecureMockStore(false, null, null);

      const { container } = render(
        <AnimatedBackground>
          <div>Content</div>
        </AnimatedBackground>,
      );

      // Should not have CSS animation classes that conflict with Tailwind transitions
      const allElements = container.querySelectorAll('*');

      for (const element of allElements) {
        // Should not use CSS animations for opacity changes
        expect(element.className).not.toMatch(/animate-\w+/);

        // Should use Tailwind transition utilities instead
        if (element.className.includes('transition')) {
          expect(element.className).toMatch(/transition-opacity|duration-\d+|ease-\w+/);
        }
      }
    });

    it('uses correct background image properties', () => {
      setupSecureMockStore(false, null, null);

      const { container } = render(
        <AnimatedBackground>
          <div>Content</div>
        </AnimatedBackground>,
      );

      const grayLogo = container.querySelector('[class*="aimakerspace-gray-192.png"]');
      const yellowLogo = container.querySelector('[class*="aimakerspace-i-192.png"]');

      for (const logo of [grayLogo, yellowLogo]) {
        expect(logo).toHaveClass(
          'bg-[length:192px_192px]', // Specific size
          'bg-center', // Centered positioning
          'bg-repeat', // Tiled pattern
        );
      }
    });
  });

  describe('gradient and color scheme', () => {
    it('applies correct gradient color scheme', () => {
      mockUseChatStore.mockReturnValue({
        apiKey: '',
        isApiKeyValid: false,
      });

      const { container } = render(
        <AnimatedBackground>
          <div>Content</div>
        </AnimatedBackground>,
      );

      const gradientBg = container.querySelector('[class*="bg-gradient-to-bl"]');
      expect(gradientBg).toHaveClass(
        'bg-gradient-to-bl',
        'from-[#0f172a]', // Dark blue-gray start
        'via-[#1e1a78]', // Purple middle
        'to-[#0f172a]', // Dark blue-gray end
      );
    });

    it('applies correct transform scaling', () => {
      mockUseChatStore.mockReturnValue({
        apiKey: '',
        isApiKeyValid: false,
      });

      const { container } = render(
        <AnimatedBackground>
          <div>Content</div>
        </AnimatedBackground>,
      );

      const backgroundElement = container.querySelector('[class*="bg-gradient-to-bl"]');
      expect(backgroundElement).toHaveClass('origin-center', '[transform:scale(2.5)]');
    });
  });

  describe('accessibility visual considerations', () => {
    it('maintains content visibility with proper contrast', () => {
      mockUseChatStore.mockReturnValue({
        apiKey: '',
        isApiKeyValid: false,
      });

      const { container } = render(
        <AnimatedBackground>
          <div style={{ color: 'white' }}>High contrast content</div>
        </AnimatedBackground>,
      );

      // Content should be rendered above background
      const contentWrapper = container.querySelector('[class*="z-10"]');
      expect(contentWrapper).toBeInTheDocument();

      // Backdrop blur should not completely obscure content
      const backdropElement = container.querySelector('[class*="backdrop-blur-"]');
      expect(backdropElement).toHaveClass('backdrop-blur-[2px]'); // Light blur only
    });

    it('does not interfere with focus states', () => {
      mockUseChatStore.mockReturnValue({
        apiKey: '',
        isApiKeyValid: false,
      });

      const { container } = render(
        <AnimatedBackground>
          <button type="button" className="focus:ring-2 focus:ring-blue-500">
            Focusable Element
          </button>
        </AnimatedBackground>,
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('focus:ring-2', 'focus:ring-blue-500');

      // Background should not have focus styles that could interfere
      const backgroundElements = container.querySelectorAll('[class*="absolute"]');
      for (const element of backgroundElements) {
        expect(element.className).not.toMatch(/focus:/);
      }
    });
  });

  describe('layout structure validation', () => {
    it('maintains proper DOM hierarchy', () => {
      mockUseChatStore.mockReturnValue({
        apiKey: '',
        isApiKeyValid: false,
      });

      const { container } = render(
        <AnimatedBackground>
          <div data-testid="user-content">User Content</div>
        </AnimatedBackground>,
      );

      // Expected structure:
      // - Main container (fixed positioned)
      //   - Background container (absolute)
      //     - Gray logo layer
      //     - Yellow logo layer
      //     - Backdrop blur layer
      //   - Content wrapper (relative, z-10)
      //     - User content

      const mainContainer = container.firstChild as HTMLElement;
      const backgroundContainer = mainContainer.querySelector('[class*="bg-gradient-to-bl"]');
      const contentWrapper = mainContainer.querySelector('[class*="z-10"]');

      expect(backgroundContainer).toBeInTheDocument();
      expect(contentWrapper).toBeInTheDocument();

      // Content should come after background in DOM order
      if (contentWrapper && backgroundContainer) {
        expect(contentWrapper.compareDocumentPosition(backgroundContainer)).toBe(
          Node.DOCUMENT_POSITION_PRECEDING,
        );
      }
    });

    it('applies absolute positioning to all background layers', () => {
      mockUseChatStore.mockReturnValue({
        apiKey: '',
        isApiKeyValid: false,
      });

      const { container } = render(
        <AnimatedBackground>
          <div>Content</div>
        </AnimatedBackground>,
      );

      const backgroundLayers = container.querySelectorAll('[class*="absolute"][class*="inset-0"]');

      // Should have: background gradient + 2 logo layers + backdrop blur = 4 layers
      expect(backgroundLayers.length).toBe(4);

      for (const layer of backgroundLayers) {
        expect(layer).toHaveClass('absolute', 'inset-0');
      }
    });
  });
});
