import type { ReactNode } from 'react';

interface ChatLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
}

/**
 * Enhanced chat layout with glassmorphism effects.
 * Works beautifully with AnimatedBackground component.
 * Provides semantic structure with contained header/footer sections.
 * Matches the old project's beautiful card-based design.
 */
export function ChatLayout({ children, header, footer }: ChatLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col p-4">
      {/* Header Section - Contained glassmorphism card */}
      {header && (
        <header className="mb-6 w-full max-w-4xl mx-auto rounded-3xl border border-solid border-[rgba(255,255,255,0.1)] bg-white/5 shadow-[rgba(0,0,0,0.3)_0px_2px_4px_0px] backdrop-blur-xl">
          <div className="py-4 pl-5 pr-6">{header}</div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Footer Section - Contained glassmorphism card */}
      {footer && (
        <footer className="mt-6 w-full max-w-4xl mx-auto rounded-3xl border border-solid border-[rgba(255,255,255,0.1)] bg-white/5 shadow-[rgba(0,0,0,0.3)_0px_2px_4px_0px] backdrop-blur-xl">
          <div className="py-4 pl-5 pr-6">{footer}</div>
        </footer>
      )}
    </div>
  );
}
