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
  // Store timeout IDs for cleanup
  let initTimeoutId: NodeJS.Timeout | null = null;
  let welcomeAnimationTimeoutId: NodeJS.Timeout | null = null;

  return {
    // Initial state
    isInitialized: false,
    isRehydrated: true,

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
      if (initTimeoutId) {
        clearTimeout(initTimeoutId);
        initTimeoutId = null;
      }

      initTimeoutId = setTimeout(() => {
        get().checkWelcomeAnimation();
        initTimeoutId = null;
      }, 0);

      logger.debug('✅ Store initialized and welcome animation check queued', {
        component: 'SystemSlice',
        action: 'initializeStore',
      });
    },

  /** Checks session and updates API key state */
  checkSession: async () => {
    const { getApiKeySession } = await import('@/app/actions/api-key-actions');

    try {
      const session = await getApiKeySession();
      const currentState = get();

      if (session?.hasValidKey) {
        // Update auth slice
        set({
          hasValidApiKey: true,
          apiKeyType: session.keyType || currentState.lastSuccessfulKeyType,
          apiKeyLength: session.keyLength,
          hasCompletedInitialSetup: true,
          lastSuccessfulKeyType: session.keyType || currentState.lastSuccessfulKeyType,
        });

        // Update UI slice
        currentState.setIsExpanded(true);
        currentState.setBackgroundMode('valid');

        logger.info('Session restored with valid API key', {
          action: 'checkSession',
          keyType: session.keyType,
        });
      } else {
        set({
          hasValidApiKey: false,
          apiKeyType: null,
          apiKeyLength: null,
        });

        currentState.setIsExpanded(false);
        currentState.setBackgroundMode('invalid');
      }
    } catch (error) {
      logger.error(
        'Session check failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          component: 'SystemSlice',
          action: 'checkSession',
        },
      );

      set({
        hasValidApiKey: false,
        apiKeyType: null,
        apiKeyLength: null,
      });

      get().setIsExpanded(false);
      get().setBackgroundMode('invalid');
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
        if (welcomeAnimationTimeoutId) {
          clearTimeout(welcomeAnimationTimeoutId);
          welcomeAnimationTimeoutId = null;
        }

        welcomeAnimationTimeoutId = setTimeout(() => {
          const currentState = get();
          if (currentState.isAnimating) {
            logger.debug('🎬 Animation state confirmed after timeout', {
              component: 'SystemSlice',
              action: 'checkWelcomeAnimation-confirm',
              isAnimating: currentState.isAnimating,
            });
          }
          welcomeAnimationTimeoutId = null;
        }, 50);
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
      if (welcomeAnimationTimeoutId) {
        clearTimeout(welcomeAnimationTimeoutId);
        welcomeAnimationTimeoutId = null;
      }

      welcomeAnimationTimeoutId = setTimeout(() => {
        const currentState = get();
        if (currentState.isAnimating) {
          logger.debug('🎬 Animation state confirmed for existing message', {
            component: 'SystemSlice',
            action: 'checkWelcomeAnimation-confirm-existing',
            isAnimating: currentState.isAnimating,
          });
        }
        welcomeAnimationTimeoutId = null;
      }, 50);
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
    }); // partial state update
  },

    /** Cleanup function to clear all timeouts */
    cleanup: () => {
      if (initTimeoutId) {
        clearTimeout(initTimeoutId);
        initTimeoutId = null;
      }
      if (welcomeAnimationTimeoutId) {
        clearTimeout(welcomeAnimationTimeoutId);
        welcomeAnimationTimeoutId = null;
      }
    },
  };
};
