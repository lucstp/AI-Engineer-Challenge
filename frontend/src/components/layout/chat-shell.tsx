import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ChatShellProps {
  children: ReactNode;
  className?: string;
  /**
   * Whether to apply maximum width constraint
   * @default true
   */
  maxWidth?: boolean;
}

/**
 * Enhanced chat shell with glassmorphism effects.
 * Uses Card design system internally for consistency.
 * Provides responsive container that complements the AnimatedBackground component.
 */
export function ChatShell({ children, className, maxWidth = true }: ChatShellProps) {
  return (
    <Card className={cn('mx-auto w-full', maxWidth && 'max-w-4xl', className)}>
      <CardContent className="space-y-4 p-4 sm:p-8">{children}</CardContent>
    </Card>
  );
}
