// src/hooks/use-animation-state.ts
'use client';

import { useEffect, useState } from 'react';
import { useChatStore } from '@/store';

/**
 * Animation state hook with Silicon Valley-grade user experience.
 *
 * Silicon Valley approach:
 * - Provide smart defaults immediately (invalid state for new users)
 * - Smooth transitions when persisted state loads
 * - No loading screens or hydration delays
 * - Seamless background state synchronization
 */
export function useAnimationState() {
  const {
    hasValidApiKey,
    apiKeyType,
    apiKeyLength,
    hasSeenWelcomeAnimation,
    hasCompletedInitialSetup,
    isRehydrated,
  } = useChatStore();

  const [isHydrated, setIsHydrated] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true); // Smart default

  // Handle hydration and determine user type with smooth transitions
  useEffect(() => {
    // Wait for actual Zustand rehydration to complete
    if (isRehydrated) {
      setIsHydrated(true);
      setIsFirstTimeUser(!hasCompletedInitialSetup);
    }
  }, [hasCompletedInitialSetup, isRehydrated]);

  // Calculate animation states with smart defaults
  // Default to invalid state (most users don't have API keys), then transition smoothly
  const shouldShowValidAnimation =
    hasValidApiKey && apiKeyType && apiKeyLength != null && apiKeyLength > 0;
  const shouldShowInvalidAnimation = !shouldShowValidAnimation;
  const shouldPlayWelcomeAnimation = !hasSeenWelcomeAnimation && isFirstTimeUser && isHydrated;

  return {
    // Background animation states (smart defaults)
    shouldShowValidAnimation,
    shouldShowInvalidAnimation,
    animationState: shouldShowValidAnimation ? 'valid' : 'invalid',

    // User experience states
    isFirstTimeUser,
    isReturningUser: !isFirstTimeUser,

    // Animation control
    shouldPlayWelcomeAnimation,
    shouldSkipAllAnimations: hasSeenWelcomeAnimation && !isFirstTimeUser,

    // Ready states
    isHydrationComplete: isHydrated,
    isAnimationReady: isHydrated,
  };
}
