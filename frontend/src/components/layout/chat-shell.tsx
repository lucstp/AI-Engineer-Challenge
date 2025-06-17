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
 * Renders a visually enhanced chat container with glassmorphism effects.
 *
 * Provides a responsive, accessible shell for chat content, featuring rounded corners, semi-transparent background, border, shadow, and backdrop blur. Complements the `AnimatedBackground` component for layered visual effects.
 *
 * @param children - The content to display inside the chat shell.
 * @param className - Optional additional CSS classes for custom styling.
 * @param maxWidth - If true, constrains the container to a maximum width for improved readability (default: true).
 */
export function ChatShell({ children, className, maxWidth = true }: ChatShellProps) {
  return (
    <div
      className={cn(
        'p-4 mx-auto w-full space-y-4 rounded-3xl border border-solid border-[rgba(255,255,255,0.1)] bg-white/5 shadow-[rgba(0,0,0,0.3)_0px_2px_4px_0px] backdrop-blur-xl sm:p-8',
        maxWidth && 'max-w-4xl',
        className,
      )}
    >
      {children}
    </div>
  );
}
