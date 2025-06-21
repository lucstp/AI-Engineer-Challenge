// src/store/chat-store.ts
import { chatLogger, logger, toast } from '@/lib';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { ChatState } from './store.types';

// Welcome message constants to avoid duplication
const WELCOME_MESSAGE =
  "Hello! I'm your AI assistant. To get started, please enter your OpenAI API key in the field below. I'll be ready to help once you've added your key.";

/**
 * Generates a standardized welcome message object from the assistant.
 *
 * @returns An object representing the assistant's welcome message, including id, content, role, and timestamp.
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
 * Determines whether the current user is accessing the chat for the first time by checking for persisted chat data in localStorage.
 *
 * @returns `true` if no chat data is found in localStorage or if localStorage is unavailable; otherwise, `false`.
 */
function isFirstTimeUser(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }

  try {
    const stored = localStorage.getItem('chat-storage');
    return !stored; // First time if no data exists
  } catch {
    return true;
  }
}

/**
 * Determines whether a valid API key is present in the persisted chat store state.
 *
 * @returns True if the persisted state indicates a valid API key; otherwise, false.
 */
function hasPersistedApiKey(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const stored = localStorage.getItem('chat-storage');
    if (!stored) {
      return false;
    }

    const parsed = JSON.parse(stored);
    return parsed?.state?.hasValidApiKey === true;
  } catch {
    return false;
  }
}

// Initial state for data only (without action functions)
// Start with consistent server/client state to prevent hydration mismatch
const INITIAL_DATA_STATE = {
  messages: [createWelcomeMessage()], // Always start with welcome message
  hasValidApiKey: false, // Always start false, will be updated after hydration
  apiKeyType: null as string | null,
  apiKeyLength: null as number | null,
  apiKeyError: null as string | null,
  isInitialized: false, // Start false, will be initialized after hydration
  selectedModel: 'gpt-4.1-mini',
  isLoading: false,
  isTyping: false,
  showTimestamps: false,
  isAnimating: false, // Always false initially - no hydration issues
  animatedContent: '',
  isExpanded: false, // Start collapsed, will be updated after hydration
  hasSeenWelcomeAnimation: false, // Allow animation for first-time users
  hasCompletedInitialSetup: false, // Start false, will be updated after hydration
  lastSuccessfulKeyType: null as string | null,
  isRehydrated: false, // Will be set to true by components after detecting rehydration
};

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initialize with data state
        ...INITIAL_DATA_STATE,

        // Messages actions
        setMessages: (messages) => {
          logger.debug('🔄 setMessages called', {
            component: 'ChatStore',
            action: 'setMessages',
            messageCount: messages.length,
            messages: messages.map((m) => ({
              id: m.id,
              content: `${m.content.substring(0, 30)}...`,
              role: m.role,
            })),
          });
          set({ messages });
        },
        addMessage: (message) =>
          set((state) => ({
            messages: [...state.messages, message],
          })),
        updateMessage: (id, updates) =>
          set((state) => ({
            messages: state.messages.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg)),
          })),
        clearMessages: () => {
          logger.debug('🗑️ clearMessages called', {
            component: 'ChatStore',
            action: 'clearMessages',
          });
          set({ messages: [] });
        },

        // API Key actions
        setApiKey: async (key: string) => {
          const { validateAndStoreApiKey } = await import('@/app/actions/api-key-actions');

          set({ isLoading: true, apiKeyError: null });

          try {
            const result = await validateAndStoreApiKey(key);

            if (result.success && result.data) {
              const keyType = result.data.keyInfo?.type || null;
              const keyLength = result.data.keyInfo?.length || null;

              const confirmationMessage = {
                id: `key-confirmation-${Date.now()}`,
                content: 'Thank you for adding your API key! How can I help you today?',
                role: 'assistant' as const,
                timestamp: new Date().toISOString(),
              };

              const currentState = get();

              // Single atomic state update
              set({
                hasValidApiKey: true,
                apiKeyType: keyType,
                apiKeyLength: keyLength,
                apiKeyError: null,
                isLoading: false,
                hasCompletedInitialSetup: true,
                lastSuccessfulKeyType: keyType,
                isExpanded: true,
                messages: [...currentState.messages, confirmationMessage],
                isAnimating: true,
                animatedContent: confirmationMessage.content,
              });

              chatLogger.success('API Key validated and setup complete', {
                action: 'setApiKey',
                keyType,
                keyLength,
              });
              toast.success('API key added successfully!');
              return { success: true, error: null };
            }

            set({
              hasValidApiKey: false,
              apiKeyType: null,
              apiKeyLength: null,
              apiKeyError: result.error || 'Validation failed',
              isLoading: false,
            });
            return { success: false, error: result.error || 'Validation failed' };
          } catch (error) {
            const errorMessage = 'Failed to validate API key';
            set({
              hasValidApiKey: false,
              apiKeyType: null,
              apiKeyLength: null,
              apiKeyError: errorMessage,
              isLoading: false,
            });
            return { success: false, error: errorMessage };
          }
        },

        deleteApiKey: async () => {
          const { deleteApiKeySession } = await import('@/app/actions/api-key-actions');

          try {
            await deleteApiKeySession();

            const welcomeMessage = createWelcomeMessage();

            set({
              hasValidApiKey: false,
              apiKeyType: null,
              apiKeyLength: null,
              apiKeyError: null,
              messages: [welcomeMessage],
              isExpanded: false,
              isAnimating: true,
              animatedContent: welcomeMessage.content,
            });
          } catch (error) {
            logger.error(
              'Failed to delete API key',
              error instanceof Error ? error : new Error(String(error)),
              {
                component: 'ChatStore',
                action: 'deleteApiKey',
              },
            );
            toast.error('Failed to delete API key');
          }
        },

        // Initialize store after rehydration
        initializeStore: () => {
          const state = get();

          logger.debug('🚀 initializeStore called after rehydration', {
            component: 'ChatStore',
            action: 'initializeStore',
            isInitialized: state.isInitialized,
            messagesCount: state.messages.length,
            hasSeenWelcomeAnimation: state.hasSeenWelcomeAnimation,
          });

          // Skip if already initialized
          if (state.isInitialized) {
            logger.debug('✅ Store already initialized', {
              component: 'ChatStore',
              action: 'initializeStore',
            });
            return;
          }

          // Mark as initialized and trigger welcome animation check
          set({ isInitialized: true });

          // Check if we need to show welcome animation
          // This will handle both first-time users and returning users properly
          setTimeout(() => {
            get().checkWelcomeAnimation();
          }, 0);

          logger.debug('✅ Store initialized and welcome animation check queued', {
            component: 'ChatStore',
            action: 'initializeStore',
          });
        },

        // Session check with proper array handling
        checkSession: async () => {
          const { getApiKeySession } = await import('@/app/actions/api-key-actions');

          try {
            const session = await getApiKeySession();
            const currentState = get();

            if (session?.hasValidKey) {
              set({
                hasValidApiKey: true,
                apiKeyType: session.keyType || currentState.lastSuccessfulKeyType,
                apiKeyLength: session.keyLength,
                hasCompletedInitialSetup: true,
                lastSuccessfulKeyType: session.keyType || currentState.lastSuccessfulKeyType,
                isExpanded: true,
              });
              chatLogger.success('Session restored with valid API key', {
                action: 'checkSession',
                keyType: session.keyType,
              });
            } else {
              // Only update API key related state, DO NOT touch messages
              // Messages should only be managed by initializeStore for first-time users
              set({
                hasValidApiKey: false,
                apiKeyType: null,
                apiKeyLength: null,
                isExpanded: false,
              });
            }
          } catch (error) {
            logger.error(
              'Session check failed',
              error instanceof Error ? error : new Error(String(error)),
              {
                component: 'ChatStore',
                action: 'checkSession',
              },
            );
            // Only update API key related state, DO NOT touch messages
            set({
              hasValidApiKey: false,
              apiKeyType: null,
              apiKeyLength: null,
              isExpanded: false,
            });
          }
        },

        // Other actions
        setSelectedModel: (model) => set({ selectedModel: model }),
        setIsLoading: (loading) => set({ isLoading: loading }),
        setIsTyping: (typing) => set({ isTyping: typing }),
        setShowTimestamps: (show) => set({ showTimestamps: show }),
        setIsAnimating: (animating) => set({ isAnimating: animating }),
        setAnimatedContent: (content) => set({ animatedContent: content }),
        setIsExpanded: (expanded) => set({ isExpanded: expanded }),
        setHasSeenWelcomeAnimation: (seen) => set({ hasSeenWelcomeAnimation: seen }),
        setHasCompletedInitialSetup: (completed) => set({ hasCompletedInitialSetup: completed }),
        setIsRehydrated: (rehydrated: boolean) => set({ isRehydrated: rehydrated }),

        // Check if welcome animation should play after hydration
        checkWelcomeAnimation: () => {
          const state = get();

          logger.info('🎬 checkWelcomeAnimation called', {
            component: 'ChatStore',
            action: 'checkWelcomeAnimation',
            messagesCount: state.messages.length,
            hasSeenWelcome: state.hasSeenWelcomeAnimation,
            isInitialized: state.isInitialized,
          });

          // Case 1: No messages yet - add welcome message
          if (state.messages.length === 0) {
            const welcomeMessage = createWelcomeMessage();
            const shouldAnimate = !state.hasSeenWelcomeAnimation; // Simplified - just check if we've seen it

            logger.info('🎉 Adding welcome message (no existing messages)', {
              component: 'ChatStore',
              action: 'checkWelcomeAnimation',
              shouldAnimate,
              messageId: welcomeMessage.id,
            });

            set({
              messages: [welcomeMessage],
              isAnimating: shouldAnimate,
              animatedContent: shouldAnimate ? WELCOME_MESSAGE : '',
              hasSeenWelcomeAnimation: true,
              isInitialized: true,
            });

            // Ensure animation state is set in next tick for proper rendering
            if (shouldAnimate) {
              setTimeout(() => {
                const currentState = get();
                if (currentState.isAnimating) {
                  logger.debug('🎬 Animation state confirmed after timeout', {
                    component: 'ChatStore',
                    action: 'checkWelcomeAnimation-confirm',
                    isAnimating: currentState.isAnimating,
                  });
                }
              }, 50);
            }
          }
          // Case 2: Messages exist but we haven't seen welcome animation (first-time user with persisted state)
          else if (!state.hasSeenWelcomeAnimation) {
            logger.info('🎬 Triggering animation for existing welcome message (first-time user)', {
              component: 'ChatStore',
              action: 'checkWelcomeAnimation',
              existingMessagesCount: state.messages.length,
            });

            set({
              isAnimating: true,
              animatedContent: WELCOME_MESSAGE,
              hasSeenWelcomeAnimation: true,
            });

            // Ensure animation state is set in next tick for proper rendering
            setTimeout(() => {
              const currentState = get();
              if (currentState.isAnimating) {
                logger.debug('🎬 Animation state confirmed for existing message', {
                  component: 'ChatStore',
                  action: 'checkWelcomeAnimation-confirm-existing',
                  isAnimating: currentState.isAnimating,
                });
              }
            }, 50);
          }
          // Case 3: Returning user - animation already seen
          else {
            logger.debug('👋 Skipping animation - returning user', {
              component: 'ChatStore',
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

        // Reset with proper array initialization
        reset: async () => {
          try {
            const { deleteApiKeySession } = await import('@/app/actions/api-key-actions');
            await deleteApiKeySession();
            // Note: Removed direct localStorage.removeItem() - Zustand's persistence middleware handles cleanup
          } catch (error) {
            logger.error(
              'Reset cleanup failed',
              error instanceof Error ? error : new Error(String(error)),
              {
                component: 'ChatStore',
                action: 'reset',
              },
            );
          }

          const welcomeMessage = createWelcomeMessage();

          // Reset state - Zustand persistence middleware will handle storage cleanup automatically
          set({
            ...INITIAL_DATA_STATE,
            messages: [welcomeMessage],
            isAnimating: true,
            animatedContent: welcomeMessage.content,
            isInitialized: true,
          });
        },
      }),
      {
        name: 'chat-storage',
        partialize: (state: ChatState) => {
          const persistedData = {
            selectedModel: state.selectedModel,
            messages: state.messages,
            showTimestamps: state.showTimestamps,
            hasSeenWelcomeAnimation: state.hasSeenWelcomeAnimation,
            hasCompletedInitialSetup: state.hasCompletedInitialSetup,
            lastSuccessfulKeyType: state.lastSuccessfulKeyType,
            isInitialized: state.isInitialized,
            isExpanded: state.isExpanded, // Persist expansion state for smooth user experience
            // Persist API key state to prevent flash on refresh
            hasValidApiKey: state.hasValidApiKey,
            apiKeyType: state.apiKeyType,
            apiKeyLength: state.apiKeyLength,
          };

          logger.debug('💾 Persisting state to localStorage', {
            component: 'ChatStore',
            action: 'partialize',
            messagesCount: persistedData.messages.length,
            isInitialized: persistedData.isInitialized,
            hasSeenWelcomeAnimation: persistedData.hasSeenWelcomeAnimation,
            hasCompletedInitialSetup: persistedData.hasCompletedInitialSetup,
            persistedDataSize: JSON.stringify(persistedData).length,
            persistedMessages: persistedData.messages.map((m) => ({
              id: m.id,
              content: m.content ? `${m.content.substring(0, 30)}...` : '[empty content]',
            })),
          });

          return persistedData;
        },
        onRehydrateStorage: () => {
          logger.info('🔄 Starting Zustand rehydration', {
            component: 'ChatStore',
            action: 'onRehydrateStorage',
          });

          return (state, error) => {
            if (error) {
              logger.error(
                '❌ Zustand rehydration failed',
                error instanceof Error ? error : new Error(String(error)),
                {
                  component: 'ChatStore',
                  action: 'onRehydrateStorage',
                },
              );
              return;
            }

            if (state) {
              logger.info('✅ Zustand rehydration complete', {
                component: 'ChatStore',
                action: 'onRehydrateStorage',
                messagesCount: state.messages?.length || 0,
                hasSeenWelcome: state.hasSeenWelcomeAnimation || false,
                isInitialized: state.isInitialized || false,
                hasValidApiKey: state.hasValidApiKey || false,
              });

              // Note: isRehydrated flag will be set by component after detecting rehydration
              // This prevents circular reference issues during store initialization
            }
          };
        },
      },
    ),
    {
      name: 'chat-store',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);
