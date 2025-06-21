// src/hooks/use-animation-state.ts
'use client';

import { useEffect, useState } from 'react';
import { useChatStore } from '@/store';

/**
 * React hook for managing animation state and user experience flags with smooth transitions and smart defaults.
 *
 * Integrates Zustand store hydration and user setup status to determine animation visibility, welcome flow, and readiness flags. Ensures seamless background state synchronization and avoids loading delays by providing immediate defaults and updating state only after store rehydration.
 *
 * @returns An object containing animation state flags, user experience indicators, animation control flags, and readiness states.
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
