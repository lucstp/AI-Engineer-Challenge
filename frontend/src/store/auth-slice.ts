import { chatLogger, logger, toast } from '@/lib';

import type { AuthSlice, SliceStateCreator } from './store.types';

/**
 * Auth slice handles API key management and authentication state
 * NEVER persists actual API keys - only metadata like type and length
 */
export const createAuthSlice: SliceStateCreator<AuthSlice> = (set, get) => ({
  // Initial state
  hasValidApiKey: false,
  apiKeyType: null,
  apiKeyLength: null,
  apiKeyError: null,
  hasCompletedInitialSetup: false,
  lastSuccessfulKeyType: null,

  // Actions

  /** Validates and stores an API key securely */
  setApiKey: async (key: string) => {
    const { validateAndStoreApiKey } = await import('@/app/actions/api-key-actions');

    // Set loading state through other slices
    const currentState = get();
    currentState.setIsLoading(true);

    set({ apiKeyError: null });

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

        // Update auth state
        set({
          hasValidApiKey: true,
          apiKeyType: keyType,
          apiKeyLength: keyLength,
          apiKeyError: null,
          hasCompletedInitialSetup: true,
          lastSuccessfulKeyType: keyType,
        });

        // Update other slices through their actions
        currentState.setIsLoading(false);
        currentState.setIsExpanded(true);
        currentState.setBackgroundMode('valid');
        currentState.addMessage(confirmationMessage);
        currentState.setIsAnimating(true);
        currentState.setAnimatedContent(confirmationMessage.content);

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
      });

      currentState.setIsLoading(false);
      return { success: false, error: result.error || 'Validation failed' };
    } catch (error) {
      const errorMessage = 'Failed to validate API key';
      set({
        hasValidApiKey: false,
        apiKeyType: null,
        apiKeyLength: null,
        apiKeyError: errorMessage,
      });

      currentState.setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  },

  /** Deletes the API key and resets to welcome state */
  deleteApiKey: async () => {
    const { deleteApiKeySession } = await import('@/app/actions/api-key-actions');

    try {
      await deleteApiKeySession();

      const welcomeMessage = {
        id: 'welcome',
        content:
          "Hello! I'm your AI assistant. To get started, please enter your OpenAI API key in the field below. I'll be ready to help once you've added your key.",
        role: 'assistant' as const,
        timestamp: new Date().toISOString(),
      };

      // Update auth state
      set({
        hasValidApiKey: false,
        apiKeyType: null,
        apiKeyLength: null,
        apiKeyError: null,
      });

      // Update other slices
      const currentState = get();
      currentState.setMessages([welcomeMessage]);
      currentState.setIsExpanded(false);
      currentState.setBackgroundMode('invalid');
      currentState.setIsAnimating(true);
      currentState.setAnimatedContent(welcomeMessage.content);
    } catch (error) {
      logger.error(
        'Failed to delete API key',
        error instanceof Error ? error : new Error(String(error)),
        {
          component: 'AuthSlice',
          action: 'deleteApiKey',
        },
      );
      toast.error('Failed to delete API key');
    }
  },

  /** Sets whether the initial setup has been completed */
  setHasCompletedInitialSetup: (completed) => set({ hasCompletedInitialSetup: completed }),
});
