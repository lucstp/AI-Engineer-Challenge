'use client';

import { Bot, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

// Simple prop interface (1 property) - inline following TypeScript organization rules
interface EmptyStateProps {
  className?: string;
}

/**
 * EmptyState - Client Component for welcome message display
 *
 * Features:
 * - Beautiful welcome UI with animated elements
 * - Glassmorphism styling matching project design
 * - Motion animation on mount with rotating sparkles
 * - Single Responsibility: Only handles empty state welcome UI
 */
export function EmptyState({ className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`flex min-h-[400px] flex-col items-center justify-center space-y-6 px-6 text-center ${className || ''}`}
    >
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
          <Bot className="h-10 w-10 text-white" />
        </div>
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{ rotate: 360 }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'linear',
          }}
        >
          <Sparkles className="h-6 w-6 text-yellow-300" />
        </motion.div>
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-white">Welcome to AI Assistant</h2>
        <p className="max-w-md leading-relaxed text-blue-200">
          I'm your AI assistant, ready to help with any questions or tasks. Enter your OpenAI API
          key to get started with our conversation.
        </p>
      </div>

      <motion.div
        className="max-w-sm rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <p className="text-sm text-blue-100">
          ✨ <strong>Tip:</strong> Your API key is stored securely in your browser and never sent
          anywhere except directly to OpenAI.
        </p>
      </motion.div>
    </motion.div>
  );
}
