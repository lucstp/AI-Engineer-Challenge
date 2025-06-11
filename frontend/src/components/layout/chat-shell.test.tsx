import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ChatShell } from './chat-shell';

describe('ChatShell', () => {
  it('renders children', () => {
    render(
      <ChatShell>
        <div data-testid="child">Child Content</div>
      </ChatShell>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('applies default classes and maxWidth by default', () => {
    render(
      <ChatShell>
        <div>Content</div>
      </ChatShell>,
    );
    const container = screen.getByText('Content').parentElement;
    expect(container).toHaveClass('mx-auto');
    expect(container).toHaveClass('w-full');
    expect(container).toHaveClass('space-y-4');
    expect(container).toHaveClass('max-w-4xl');
  });

  it('does not apply max-w-4xl when maxWidth is false', () => {
    render(
      <ChatShell maxWidth={false}>
        <div>Content</div>
      </ChatShell>,
    );
    const container = screen.getByText('Content').parentElement;
    expect(container).not.toHaveClass('max-w-4xl');
  });

  it('merges custom className', () => {
    render(
      <ChatShell className="custom-class">
        <div>Content</div>
      </ChatShell>,
    );
    const container = screen.getByText('Content').parentElement;
    expect(container).toHaveClass('custom-class');
  });
});
