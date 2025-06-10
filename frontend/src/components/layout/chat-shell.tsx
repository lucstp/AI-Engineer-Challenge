import type { ReactNode } from 'react';
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
 * Basic chat shell container component.
 * Provides responsive container with basic spacing and structure.
 * Phase 3 will add glassmorphism effects and animations.
 */
export function ChatShell({ children, className, maxWidth = true }: ChatShellProps) {
  return (
    <div className={cn('mx-auto w-full space-y-4', maxWidth && 'max-w-4xl', className)}>
      {children}
    </div>
  );
}
