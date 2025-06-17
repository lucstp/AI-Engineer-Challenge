import type { ReactNode } from 'react';
import { Card, CardFooter, CardHeader } from '@/components/ui';

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
 * Now uses shadcn/ui Card components for better semantics and maintainability.
 */
export function ChatLayout({ children, header, footer }: ChatLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col p-4">
      {/* Header Section - Semantic Card with glassmorphism styling */}
      {header && (
        <Card className="mx-auto mb-6 w-full max-w-4xl">
          <CardHeader>{header}</CardHeader>
        </Card>
      )}

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-4xl flex-1">{children}</main>

      {/* Footer Section - Semantic Card with glassmorphism styling */}
      {footer && (
        <Card className="mx-auto mt-6 w-full max-w-4xl">
          <CardFooter>{footer}</CardFooter>
        </Card>
      )}
    </div>
  );
}
