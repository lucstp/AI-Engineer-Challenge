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
    // The Card element (grandparent) has the layout classes
    const cardContent = screen.getByText('Content').parentElement;
    const cardElement = cardContent?.parentElement;
    // mx-auto is not applied by default in the component
    expect(cardElement).toHaveClass('w-full');
    expect(cardElement).toHaveClass('max-w-4xl');

    // The CardContent element has the actual content classes
    expect(cardContent).toHaveClass('flex', 'h-full', 'flex-col', 'p-4');
  });

  it('does not apply max-w-4xl when maxWidth is false', () => {
    render(
      <ChatShell maxWidth={false}>
        <div>Content</div>
      </ChatShell>,
    );
    const cardContent = screen.getByText('Content').parentElement;
    const cardElement = cardContent?.parentElement;
    expect(cardElement).not.toHaveClass('max-w-4xl');
  });

  it('merges custom className', () => {
    render(
      <ChatShell className="custom-class">
        <div>Content</div>
      </ChatShell>,
    );
    const cardContent = screen.getByText('Content').parentElement;
    const cardElement = cardContent?.parentElement;
    expect(cardElement).toHaveClass('custom-class');
  });
});
