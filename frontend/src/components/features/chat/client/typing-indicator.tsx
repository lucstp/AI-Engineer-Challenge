'use client';

import { motion } from 'motion/react';

// Simple prop interface (1 property) - inline following TypeScript organization rules
interface TypingIndicatorProps {
  className?: string;
}

/**
 * TypingIndicator - Client Component for animated typing indicator
 *
 * Features:
 * - Motion/react animated dots with staggered animation
 * - Beautiful blue color scheme matching design
 * - Accessible "Assistant is typing" message
 * - Single Responsibility: Only handles typing indicator animation
 */
export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2 opacity-80 ${className || ''}`}>
      <div className="flex gap-1">
        <motion.span
          className="block h-1.5 w-1.5 rounded-full bg-blue-300"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 1.2,
            repeat: Number.POSITIVE_INFINITY,
            delay: 0,
          }}
        />
        <motion.span
          className="block h-1.5 w-1.5 rounded-full bg-blue-300"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 1.2,
            repeat: Number.POSITIVE_INFINITY,
            delay: 0.2,
          }}
        />
        <motion.span
          className="block h-1.5 w-1.5 rounded-full bg-blue-300"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 1.2,
            repeat: Number.POSITIVE_INFINITY,
            delay: 0.4,
          }}
        />
      </div>
      <span className="ml-2 text-xs text-blue-300">Assistant is typing…</span>
    </div>
  );
}
