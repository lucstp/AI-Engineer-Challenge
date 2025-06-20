// src/hooks/use-animation-state.ts
'use client';

import { useEffect, useState } from 'react';
import { useChatStore } from '@/store';

/**
 * Simplified animation state hook for background animations and welcome states.
 *
 * Focuses on:
 * - Background animation states (valid/invalid API key)
 * - Welcome animation control
 * - Hydration safety
 */
export function useAnimationState() {
  const {
    hasValidApiKey,
    apiKeyType,
    apiKeyLength,
    hasSeenWelcomeAnimation,
    hasCompletedInitialSetup,
  } = useChatStore();

  const [isHydrated, setIsHydrated] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);

  // Handle hydration and determine user type
  useEffect(() => {
    setIsHydrated(true);

    // Determine if this is a first-time user based on completed setup
    setIsFirstTimeUser(!hasCompletedInitialSetup);
  }, [hasCompletedInitialSetup]);

  // Calculate animation states
  const shouldShowValidAnimation = hasValidApiKey && apiKeyType && apiKeyLength != null && apiKeyLength > 0;
  const shouldShowInvalidAnimation = !shouldShowValidAnimation;
  const shouldPlayWelcomeAnimation = !hasSeenWelcomeAnimation && isFirstTimeUser && isHydrated;

  return {
    // Background animation states
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
