'use client';

import { useEffect, useState } from 'react';
import { useChatStore } from '@/store';

/**
 * Custom hook for managing animation state based on API key validation
 *
 * Prevents flickering during page reload by:
 * - Maintaining animation state during session restoration
 * - Smoothly transitioning between valid/invalid states
 * - Deriving animation state from API key validation status
 */
export function useAnimationState() {
  const { hasValidApiKey, apiKeyType, apiKeyLength, isInitialized } = useChatStore();
  const [animationState, setAnimationState] = useState<'valid' | 'invalid' | 'transitioning'>('invalid');
  const [isStable, setIsStable] = useState(false);

  // Track when the session check is complete to prevent flickering
  useEffect(() => {
    // Wait a moment after initialization to let session check complete
    if (isInitialized && !isStable) {
      const timer = setTimeout(() => {
        setIsStable(true);
      }, 100); // Short delay to let session check complete

      return () => clearTimeout(timer);
    }
  }, [isInitialized, isStable]);

  // Update animation state based on API key validation
  useEffect(() => {
    if (!isStable) return; // Don't update until stable

    const shouldBeValid = hasValidApiKey && apiKeyType && apiKeyLength;
    const newState = shouldBeValid ? 'valid' : 'invalid';

    if (animationState !== newState) {
      setAnimationState('transitioning');
      // Smooth transition
      const timer = setTimeout(() => {
        setAnimationState(newState);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [hasValidApiKey, apiKeyType, apiKeyLength, isStable, animationState]);

  return {
    animationState,
    isAnimationReady: isStable,
    shouldShowValidAnimation: animationState === 'valid',
    shouldShowInvalidAnimation: animationState === 'invalid',
    isTransitioning: animationState === 'transitioning',
  };
}
