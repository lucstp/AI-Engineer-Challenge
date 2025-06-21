'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardHeader } from '@/components/ui';
import { cn } from '@/lib/utils';
import { logger } from '@/lib';
import { useChatStore } from '@/store';
import { motion } from 'motion/react';

import { AnimatedBackground } from './animated-background';

interface ChatLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
}

/**
 * Enhanced chat layout with Silicon Valley-grade user experience.
 * Includes proper hydration guard for Zustand persistence.
 *
 * Silicon Valley approach:
 * - Render immediately with smart defaults (collapsed for new users)
 * - Smooth animations when state actually changes
 * - No loading screens or hydration delays (after initial hydration)
 * - Seamless state synchronization
 */
export function ChatLayout({ children, header }: ChatLayoutProps) {
  const { isExpanded, hasValidApiKey, setIsExpanded } = useChatStore();
  const [hydrated, setHydrated] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const previousExpandedState = useRef<boolean | null>(null);

  // Hydration guard - prevent SSR/CSR mismatch
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Watch for expansion state changes to trigger animations (only after hydration)
  useEffect(() => {
    if (!hydrated) {
      return;
    }

    // Skip animation on first render (initialization)
    if (previousExpandedState.current === null) {
      previousExpandedState.current = isExpanded;
      return;
    }

    // Only animate if the expanded state actually changed
    if (isExpanded !== previousExpandedState.current) {
      setShouldAnimate(true);
      previousExpandedState.current = isExpanded;

      logger.debug('🎬 ChatLayout expansion state changed', {
        component: 'ChatLayout',
        action: 'expansionChange',
        from: previousExpandedState.current,
        to: isExpanded,
        shouldAnimate: true,
      });

      // Reset animation flag after animation completes
      const timer = setTimeout(() => {
        setShouldAnimate(false);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [isExpanded, hydrated]);

  // Sync expansion state with API key validity (smooth background sync)
  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (hasValidApiKey !== isExpanded) {
      setIsExpanded(hasValidApiKey);
    }
  }, [hasValidApiKey, isExpanded, setIsExpanded, hydrated]);

  // Get motion animation values
  const getMotionValues = () => {
    return {
      minHeight: isExpanded ? 'calc(100vh - 140px)' : '500px',
      height: isExpanded ? 'calc(100vh - 140px)' : 'auto',
    };
  };

  return (
    <AnimatedBackground>
      <div className="flex min-h-screen flex-col items-center p-4">
        {/* Header Section */}
        {header && (
          <Card className={cn('w-full max-w-4xl', isExpanded ? 'mb-4' : 'mb-6')}>
            <CardHeader>{header}</CardHeader>
          </Card>
        )}

        {/* Main Content Area - Conditionally centered based on expansion */}
        <main
          className={cn(
            'flex w-full max-w-4xl flex-1',
            isExpanded ? '' : 'items-center justify-center', // Center only when collapsed
          )}
        >
          <motion.div
            className="w-full"
            initial={false}
            animate={getMotionValues()}
            transition={
              shouldAnimate ? { duration: 0.6, ease: 'easeInOut' } : { duration: 0, ease: 'linear' }
            }
            style={{ width: '100%' }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </AnimatedBackground>
  );
}
