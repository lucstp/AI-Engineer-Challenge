import type { ReactNode } from 'react';

interface ChatLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
}

/**
 * Basic chat layout foundation component.
 * Provides the basic structure with header/main/footer sections.
 * Phase 3 will add animations and beautiful styling.
 */
export function ChatLayout({ children, header, footer }: ChatLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header Section */}
      {header && (
        <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
          <div className="container mx-auto px-4 py-3">{header}</div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="container mx-auto flex-1 px-4 py-6">{children}</main>

      {/* Footer Section */}
      {footer && (
        <footer className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-t backdrop-blur">
          <div className="container mx-auto px-4 py-3">{footer}</div>
        </footer>
      )}
    </div>
  );
}
