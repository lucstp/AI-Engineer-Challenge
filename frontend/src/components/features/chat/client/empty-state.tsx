'use client';

import { useEffect, useState } from 'react';
import { useChatStore } from '@/store';
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
 * - Beautiful welcome UI with animated elements for first-time users
 * - Static "ready to help" message for returning users (no animation)
 * - Glassmorphism styling matching project design
 * - FIXED: Animation only plays once per user, persisted in localStorage
 * - Single Responsibility: Only handles empty state welcome UI
 */
export function EmptyState({ className }: EmptyStateProps) {
  const { setHasSeenWelcomeAnimation } = useChatStore();
  const [showingWelcome, setShowingWelcome] = useState(true);
  const [hasCheckedInitialState, setHasCheckedInitialState] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Check localStorage ONCE on mount to determine initial display and animation behavior
  useEffect(() => {
    if (hasCheckedInitialState) {
      return;
    }

    const storage = localStorage.getItem('chat-storage');
    let hasSeenBefore = false;

    if (storage) {
      try {
        const parsed = JSON.parse(storage);
        hasSeenBefore = parsed?.state?.hasSeenWelcomeAnimation === true;
      } catch (error) {
        console.warn('Failed to parse localStorage data, treating as first-time user:', error);
        hasSeenBefore = false;
      }
    }

    logger.debug('EmptyState initial check', {
      component: 'EmptyState',
      hasSeenBefore,
      hasStorage: !!storage
    });

    if (hasSeenBefore) {
      // Returning user - show "ready to help" immediately WITHOUT animation
      setShowingWelcome(false);
      setShouldAnimate(false);
    } else {
      // First time user - show welcome with animation and mark as seen
      setShowingWelcome(true);
      setShouldAnimate(true);

      const timer = setTimeout(() => {
        if (process.env.NODE_ENV === 'development') {
          console.log('🎬 Marking welcome animation as seen');
        }
        setHasSeenWelcomeAnimation(true);
      }, 2000); // Give user time to read the welcome

      return () => clearTimeout(timer);
    }

    setHasCheckedInitialState(true);
  }, [setHasSeenWelcomeAnimation, hasCheckedInitialState]);

  // Show returning user content WITHOUT animation
  if (!showingWelcome) {
    return (
      <div
        className={`flex min-h-[400px] flex-col items-center justify-center space-y-6 px-6 text-center ${className || ''}`}
      >
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
            <Bot className="h-10 w-10 text-white" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-white">Always ready to help</h2>
          <p className="max-w-md leading-relaxed text-blue-200">
            Enter your OpenAI API key below to start a conversation.
          </p>
        </div>
      </div>
    );
  }

  // Show first-time welcome WITH animation
  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
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
          animate={shouldAnimate ? { rotate: 360 } : { rotate: 0 }}
          transition={{
            duration: shouldAnimate ? 8 : 0,
            repeat: shouldAnimate ? Number.POSITIVE_INFINITY : 0,
            ease: 'linear',
          }}
        >
          <Sparkles className="h-6 w-6 text-yellow-300" />
        </motion.div>
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-white">Welcome to AI Chat Assistant</h2>
        <p className="max-w-md leading-relaxed text-blue-200">
          I'm your AI assistant, ready to help with any questions or tasks. Enter your OpenAI API
          key to get started with our conversation.
        </p>
      </div>

      <motion.div
        className="max-w-sm rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
        whileHover={shouldAnimate ? { scale: 1.02 } : { scale: 1 }}
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
