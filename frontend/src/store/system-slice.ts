import { logger } from '@/lib';

import type { SliceStateCreator, SystemSlice } from './store.types';

// Welcome message constants
const WELCOME_MESSAGE =
  "Hello! I'm your AI assistant. To get started, please enter your OpenAI API key in the field below. I'll be ready to help once you've added your key.";

/**
 * Generates a standardized welcome message object from the assistant.
 */
function createWelcomeMessage() {
  return {
    id: 'welcome',
    content: WELCOME_MESSAGE,
    role: 'assistant' as const,
    timestamp: new Date().toISOString(),
  };
}

/**
 * System slice handles initialization, session management, and system-level operations
 */
export const createSystemSlice: SliceStateCreator<SystemSlice> = (set, get) => {
  // Helper function to safely update UI state for invalid sessions
  const updateUIStateForInvalidSession = () => {
    const currentState = get();

    try {
      currentState.setIsExpanded(false);
      logger.debug('UI expansion set to false for invalid session', {
        component: 'SystemSlice',
        action: 'updateUIStateForInvalidSession',
        phase: 'ui-expansion',
      });
    } catch (uiError) {
      logger.error(
        'Failed to set UI expansion state for invalid session',
        uiError instanceof Error ? uiError : new Error(String(uiError)),
        {
          component: 'SystemSlice',
          action: 'updateUIStateForInvalidSession',
          phase: 'ui-expansion',
        },
      );
    }

    try {
      currentState.setBackgroundMode('invalid');
      logger.debug('UI background mode set to invalid', {
        component: 'SystemSlice',
        action: 'updateUIStateForInvalidSession',
        phase: 'ui-background',
      });
    } catch (uiError) {
      logger.error(
        'Failed to set UI background mode for invalid session',
        uiError instanceof Error ? uiError : new Error(String(uiError)),
        {
          component: 'SystemSlice',
          action: 'updateUIStateForInvalidSession',
          phase: 'ui-background',
        },
      );
    }
  };

  // Helper function to ensure consistent fallback state
  const updateStateForInvalidSession = () => {
    try {
      set({
        hasValidApiKey: false,
        apiKeyType: null,
        apiKeyLength: null,
      });

      logger.debug('Fallback auth state set for invalid session', {
        component: 'SystemSlice',
        action: 'updateStateForInvalidSession',
        phase: 'auth-fallback',
      });
    } catch (error) {
      logger.error(
        'Critical: Failed to set fallback auth state',
        error instanceof Error ? error : new Error(String(error)),
        {
          component: 'SystemSlice',
          action: 'updateStateForInvalidSession',
          phase: 'auth-fallback',
        },
      );
    }

    // Always attempt UI updates
    updateUIStateForInvalidSession();
  };

  return {
    // Initial state
    isInitialized: false,
    isRehydrated: true,

    // Timeout management state (not persisted)
    initTimeoutId: null,
    welcomeAnimationTimeoutId: null,

    // Actions

    /** Initializes the store after rehydration */
    initializeStore: () => {
      const state = get();

      logger.debug('🚀 initializeStore called after rehydration', {
        component: 'SystemSlice',
        action: 'initializeStore',
        isInitialized: state.isInitialized,
        messagesCount: state.messages.length,
        hasSeenWelcomeAnimation: state.hasSeenWelcomeAnimation,
      });

      if (state.isInitialized) {
        logger.debug('✅ Store already initialized');
        return;
      }

      set({ isInitialized: true });

      // Clear existing timeout if any
      const currentState = get();
      if (currentState.initTimeoutId) {
        clearTimeout(currentState.initTimeoutId);
        set({ initTimeoutId: null });
      }

      const timeoutId = setTimeout(() => {
        get().checkWelcomeAnimation();
        set({ initTimeoutId: null });
      }, 0);

      set({ initTimeoutId: timeoutId });

      logger.debug('✅ Store initialized and welcome animation check queued', {
        component: 'SystemSlice',
        action: 'initializeStore',
      });
    },

    /** Checks session and updates API key state */
    checkSession: async () => {
      let sessionData: Awaited<
        ReturnType<typeof import('@/app/actions/api-key-actions').getApiKeySession>
      > | null = null;
      const errorContext: Record<string, unknown> = {};

      try {
        const { getApiKeySession } = await import('@/app/actions/api-key-actions');
        sessionData = await getApiKeySession();
        errorContext.sessionRetrieved = true;
        errorContext.hasValidKey = sessionData?.hasValidKey || false;
        errorContext.keyType = sessionData?.keyType || null;
      } catch (error) {
        logger.error(
          'Failed to retrieve API key session',
          error instanceof Error ? error : new Error(String(error)),
          {
            component: 'SystemSlice',
            action: 'checkSession',
            phase: 'session-retrieval',
            errorContext,
          },
        );

        // Set fallback state for auth slice
        set({
          hasValidApiKey: false,
          apiKeyType: null,
          apiKeyLength: null,
        });

        // Attempt UI updates with error handling
        updateUIStateForInvalidSession();
        return;
      }

      const currentState = get();

      if (sessionData?.hasValidKey) {
        try {
          // Update auth slice first (critical state)
          set({
            hasValidApiKey: true,
            apiKeyType: sessionData.keyType || currentState.lastSuccessfulKeyType,
            apiKeyLength: sessionData.keyLength,
            hasCompletedInitialSetup: true,
            lastSuccessfulKeyType: sessionData.keyType || currentState.lastSuccessfulKeyType,
          });

          logger.info('Auth slice updated for valid session', {
            component: 'SystemSlice',
            action: 'checkSession',
            phase: 'auth-update',
            keyType: sessionData.keyType,
            keyLength: sessionData.keyLength,
          });

          // Update UI slice with error handling
          try {
            currentState.setIsExpanded(true);
            logger.debug('UI expansion state updated successfully', {
              component: 'SystemSlice',
              action: 'checkSession',
              phase: 'ui-expansion',
            });
          } catch (uiError) {
            logger.error(
              'Failed to update UI expansion state',
              uiError instanceof Error ? uiError : new Error(String(uiError)),
              {
                component: 'SystemSlice',
                action: 'checkSession',
                phase: 'ui-expansion',
                keyType: sessionData.keyType,
              },
            );
          }

          try {
            currentState.setBackgroundMode('valid');
            logger.debug('UI background mode updated successfully', {
              component: 'SystemSlice',
              action: 'checkSession',
              phase: 'ui-background',
            });
          } catch (uiError) {
            logger.error(
              'Failed to update UI background mode',
              uiError instanceof Error ? uiError : new Error(String(uiError)),
              {
                component: 'SystemSlice',
                action: 'checkSession',
                phase: 'ui-background',
                keyType: sessionData.keyType,
              },
            );
          }

          logger.info('Session restored with valid API key', {
            component: 'SystemSlice',
            action: 'checkSession',
            keyType: sessionData.keyType,
            keyLength: sessionData.keyLength,
            hasCompletedInitialSetup: true,
          });
        } catch (error) {
          logger.error(
            'Failed to update state for valid session',
            error instanceof Error ? error : new Error(String(error)),
            {
              component: 'SystemSlice',
              action: 'checkSession',
              phase: 'valid-session-update',
              sessionData: {
                keyType: sessionData.keyType,
                keyLength: sessionData.keyLength,
                hasValidKey: sessionData.hasValidKey,
              },
            },
          );

          // Fallback to invalid state to maintain consistency
          updateStateForInvalidSession();
        }
      } else {
        try {
          // Update auth slice for invalid session
          set({
            hasValidApiKey: false,
            apiKeyType: null,
            apiKeyLength: null,
          });

          logger.debug('Auth slice updated for invalid session', {
            component: 'SystemSlice',
            action: 'checkSession',
            phase: 'auth-update-invalid',
          });

          // Update UI slice with error handling
          updateUIStateForInvalidSession();

          logger.info('Session check completed - no valid API key found', {
            component: 'SystemSlice',
            action: 'checkSession',
            hasValidKey: false,
          });
        } catch (error) {
          logger.error(
            'Failed to update state for invalid session',
            error instanceof Error ? error : new Error(String(error)),
            {
              component: 'SystemSlice',
              action: 'checkSession',
              phase: 'invalid-session-update',
            },
          );

          // Ensure fallback state
          updateStateForInvalidSession();
        }
      }
    },

    /** Checks if welcome animation should play after hydration */
    checkWelcomeAnimation: () => {
      const state = get();

      logger.info('🎬 checkWelcomeAnimation called', {
        component: 'SystemSlice',
        action: 'checkWelcomeAnimation',
        messagesCount: state.messages.length,
        hasSeenWelcome: state.hasSeenWelcomeAnimation,
        isInitialized: state.isInitialized,
      });

      // Case 1: No messages yet - add welcome message
      if (state.messages.length === 0) {
        const welcomeMessage = createWelcomeMessage();
        const shouldAnimate = !state.hasSeenWelcomeAnimation;

        logger.info('🎉 Adding welcome message (no existing messages)', {
          component: 'SystemSlice',
          action: 'checkWelcomeAnimation',
          shouldAnimate,
          messageId: welcomeMessage.id,
        });

        state.setMessages([welcomeMessage]);
        state.setIsAnimating(shouldAnimate);
        state.setAnimatedContent(shouldAnimate ? WELCOME_MESSAGE : '');
        state.setHasSeenWelcomeAnimation(true);
        set({ isInitialized: true });

        // Ensure animation state is set in next tick for proper rendering
        if (shouldAnimate) {
          // Clear existing timeout if any
          const currentState = get();
          if (currentState.welcomeAnimationTimeoutId) {
            clearTimeout(currentState.welcomeAnimationTimeoutId);
            set({ welcomeAnimationTimeoutId: null });
          }

          const timeoutId = setTimeout(() => {
            const currentState = get();
            if (currentState.isAnimating) {
              logger.debug('🎬 Animation state confirmed after timeout', {
                component: 'SystemSlice',
                action: 'checkWelcomeAnimation-confirm',
                isAnimating: currentState.isAnimating,
              });
            }
            set({ welcomeAnimationTimeoutId: null });
          }, 50);

          set({ welcomeAnimationTimeoutId: timeoutId });
        }
      }
      // Case 2: Messages exist but we haven't seen welcome animation (first-time user with persisted state)
      else if (!state.hasSeenWelcomeAnimation) {
        logger.info('🎬 Triggering animation for existing welcome message (first-time user)', {
          component: 'SystemSlice',
          action: 'checkWelcomeAnimation',
          existingMessagesCount: state.messages.length,
        });

        state.setIsAnimating(true);
        state.setAnimatedContent(WELCOME_MESSAGE);
        state.setHasSeenWelcomeAnimation(true);

        // Ensure animation state is set in next tick for proper rendering
        // Clear existing timeout if any
        const currentState = get();
        if (currentState.welcomeAnimationTimeoutId) {
          clearTimeout(currentState.welcomeAnimationTimeoutId);
          set({ welcomeAnimationTimeoutId: null });
        }

        const timeoutId = setTimeout(() => {
          const currentState = get();
          if (currentState.isAnimating) {
            logger.debug('🎬 Animation state confirmed for existing message', {
              component: 'SystemSlice',
              action: 'checkWelcomeAnimation-confirm-existing',
              isAnimating: currentState.isAnimating,
            });
          }
          set({ welcomeAnimationTimeoutId: null });
        }, 50);

        set({ welcomeAnimationTimeoutId: timeoutId });
      }
      // Case 3: Returning user - animation already seen
      else {
        logger.debug('👋 Skipping animation - returning user', {
          component: 'SystemSlice',
          action: 'checkWelcomeAnimation',
          messageCount: state.messages.length,
          hasSeenWelcome: state.hasSeenWelcomeAnimation,
        });

        // Just mark as initialized if we have messages
        if (!state.isInitialized) {
          set({ isInitialized: true });
        }
      }
    },

    /** Sets whether the store has been rehydrated */
    setIsRehydrated: (rehydrated) => set({ isRehydrated: rehydrated }),

    /** Resets the entire store to initial state */
    reset: async () => {
      // Clean up any active timeouts first
      const currentState = get();
      if (currentState.initTimeoutId) {
        clearTimeout(currentState.initTimeoutId);
      }
      if (currentState.welcomeAnimationTimeoutId) {
        clearTimeout(currentState.welcomeAnimationTimeoutId);
      }

      try {
        const { deleteApiKeySession } = await import('@/app/actions/api-key-actions');
        await deleteApiKeySession();
      } catch (error) {
        logger.error(
          'Reset cleanup failed',
          error instanceof Error ? error : new Error(String(error)),
          {
            component: 'SystemSlice',
            action: 'reset',
          },
        );
      }

      const welcomeMessage = createWelcomeMessage();

      // Reset all slices to initial state
      set({
        // Chat slice
        messages: [welcomeMessage],
        selectedModel: 'gpt-4o-mini',

        // UI slice
        isLoading: false,
        isTyping: false,
        showTimestamps: false,
        isAnimating: true,
        animatedContent: welcomeMessage.content,
        isExpanded: false,
        animationMode: 'welcome',
        backgroundMode: 'invalid',
        shouldAnimateExpansion: false,
        hasSeenWelcomeAnimation: false,

        // Auth slice
        hasValidApiKey: false,
        apiKeyType: null,
        apiKeyLength: null,
        apiKeyError: null,
        hasCompletedInitialSetup: false,
        lastSuccessfulKeyType: null,

        // System slice
        isInitialized: true,
        isRehydrated: true,
        initTimeoutId: null,
        welcomeAnimationTimeoutId: null,
      }); // partial state update
    },

    /** Cleanup function to clear all timeouts */
    cleanup: () => {
      const currentState = get();
      if (currentState.initTimeoutId) {
        clearTimeout(currentState.initTimeoutId);
      }
      if (currentState.welcomeAnimationTimeoutId) {
        clearTimeout(currentState.welcomeAnimationTimeoutId);
      }
      // Clear timeout IDs from state
      set({
        initTimeoutId: null,
        welcomeAnimationTimeoutId: null,
      });
    },
  };
};
