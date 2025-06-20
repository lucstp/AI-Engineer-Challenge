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
 * Simple chat shell container with glassmorphism styling.
 * Provides Card-based design system styling and responsive container.
 * No animations - lets ChatLayout handle all expansion logic.
 */
export function ChatShell({ children, className, maxWidth = true }: ChatShellProps) {
  return (
    <Card className={cn('flex h-full w-full flex-col', maxWidth && 'max-w-4xl', className)}>
      <CardContent className="flex h-full flex-col p-4 sm:p-8">{children}</CardContent>
    </Card>
  );
}
