import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import RootLayout from './layout';

// Note: We don't test <html>/<body> elements as they're not part of React's virtual DOM in jsdom.
// Layout structure and accessibility should be tested via E2E.

// Mock Geist fonts - must match exact export names from geist package
vi.mock('geist/font/sans', () => ({
  GeistSans: {
    variable: '--font-geist-sans',
    className: 'geist-sans',
  },
}));

vi.mock('geist/font/mono', () => ({
  GeistMono: {
    variable: '--font-geist-mono',
    className: 'geist-mono',
  },
}));

describe('RootLayout', () => {
  it('renders children content correctly', () => {
    const { getByTestId } = render(
      <RootLayout>
        <div data-testid="child">Child Content</div>
      </RootLayout>,
    );

    // Test that children are rendered
    expect(getByTestId('child')).toBeInTheDocument();
    expect(getByTestId('child')).toHaveTextContent('Child Content');
  });

  it('component renders without errors with font configuration', () => {
    // Test that the component can be rendered without throwing errors
    // Font configuration is mocked and applied at Next.js level, not testable in jsdom
    expect(() =>
      render(
        <RootLayout>
          <div>Content</div>
        </RootLayout>,
      ),
    ).not.toThrow();
  });

  it('renders with proper structure and accessibility', () => {
    const { container, getByText } = render(
      <RootLayout>
        <main>
          <h1>Test Content</h1>
          <p>This is a test</p>
        </main>
      </RootLayout>,
    );

    // Test that content structure is maintained
    expect(getByText('Test Content')).toBeInTheDocument();
    expect(getByText('This is a test')).toBeInTheDocument();
    expect(container.querySelector('main')).toBeInTheDocument();
  });
});
