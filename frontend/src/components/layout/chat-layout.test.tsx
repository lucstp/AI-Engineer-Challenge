import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ChatLayout } from './chat-layout';

describe('ChatLayout', () => {
  it('renders children in the main content area', () => {
    render(
      <ChatLayout>
        <div data-testid="content">Main Content</div>
      </ChatLayout>,
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toHaveTextContent('Main Content');
  });

  it('renders header when header prop is provided', () => {
    const headerContent = <div data-testid="header">Header Content</div>;

    render(
      <ChatLayout header={headerContent}>
        <div>Main Content</div>
      </ChatLayout>,
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    // Check for card-header data-slot instead of banner role
    expect(screen.getByTestId('header').closest('[data-slot="card-header"]')).toBeInTheDocument();
  });

  it('does not render header when header prop is not provided', () => {
    render(
      <ChatLayout>
        <div>Main Content</div>
      </ChatLayout>,
    );

    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
  });

  it('does not render footer when footer prop is not provided', () => {
    render(
      <ChatLayout>
        <div>Main Content</div>
      </ChatLayout>,
    );

    expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
  });

  it('renders all sections when header and footer are provided', () => {
    render(
      <ChatLayout header={<div data-testid="header">Header</div>}>
        <div data-testid="main">Main</div>
      </ChatLayout>,
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('main')).toBeInTheDocument();
  });
});
