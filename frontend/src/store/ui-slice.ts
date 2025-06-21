// src/store/ui-slice.ts
import type { SliceStateCreator, UiSlice } from './store.types';

/**
 * UI slice handles user interface state, animations, and visual preferences
 */
export const createUiSlice: SliceStateCreator<UiSlice> = (set, get) => {
  // Store timeout IDs for cleanup
  let animationTimeoutId: NodeJS.Timeout | null = null;

  return {
    // Initial state
    isLoading: false,
    isTyping: false,
    showTimestamps: false,
    isAnimating: false,
    animatedContent: '',
    isExpanded: false,

    // Animation states for UX flow
    animationMode: 'welcome',
    backgroundMode: 'invalid',
    shouldAnimateExpansion: false,

    // Persistence flags
    hasSeenWelcomeAnimation: false,

    // Actions

    /** Sets the loading state */
    setIsLoading: (loading) => set({ isLoading: loading }),

    /** Sets the typing indicator state */
    setIsTyping: (typing) => set({ isTyping: typing }),

    /** Sets whether timestamps should be shown */
    setShowTimestamps: (show) => set({ showTimestamps: show }),

    /** Sets the animation state */
    setIsAnimating: (animating) => set({ isAnimating: animating }),

    /** Sets the content being animated */
    setAnimatedContent: (content) => set({ animatedContent: content }),

    /** Sets the expanded state and triggers related animations */
    setIsExpanded: (expanded) => {
      const currentState = get();
      set({
        isExpanded: expanded,
        // Auto-update animation mode based on expansion
        animationMode: expanded ? 'expanded' : 'collapsed',
        // Trigger expansion animation if state is changing
        shouldAnimateExpansion: currentState.isExpanded !== expanded,
      });

      // Clear existing timeout to prevent conflicts
      if (animationTimeoutId) {
        clearTimeout(animationTimeoutId);
        animationTimeoutId = null;
      }

      // Reset animation trigger after animation duration
      if (currentState.isExpanded !== expanded) {
        animationTimeoutId = setTimeout(() => {
          set({ shouldAnimateExpansion: false });
          animationTimeoutId = null;
        }, 1000);
      }
    },

    /** Sets the animation mode for different UI states */
    setAnimationMode: (mode) => set({ animationMode: mode }),

    /** Sets the background mode for visual feedback */
    setBackgroundMode: (mode) => set({ backgroundMode: mode }),

    /** Sets whether expansion animation should be triggered */
    setShouldAnimateExpansion: (should) => {
      // Clear timeout when manually setting animation state
      if (animationTimeoutId) {
        clearTimeout(animationTimeoutId);
        animationTimeoutId = null;
      }
      set({ shouldAnimateExpansion: should });
    },

    /** Sets whether the welcome animation has been seen */
    setHasSeenWelcomeAnimation: (seen) => set({ hasSeenWelcomeAnimation: seen }),

    /** Cleanup function to clear all timeouts */
    cleanup: () => {
      if (animationTimeoutId) {
        clearTimeout(animationTimeoutId);
        animationTimeoutId = null;
      }
    },
  };
};
