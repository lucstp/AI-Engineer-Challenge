// Store exports - State management and store-specific types
import { logger } from '@/lib';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { createAuthSlice } from './auth-slice';
import { createChatSlice, createWelcomeMessage } from './chat-slice';
import type { AuthSlice, ChatSlice, StoreState, SystemSlice, UiSlice } from './store.types';
import { createSystemSlice } from './system-slice';
import {
  createAuthTestSlice,
  createChatTestSlice,
  createSystemTestSlice,
  createUiTestSlice,
} from './test-slices';
import { createUiSlice } from './ui-slice';

// Main combined store for production use
export const useChatStore = create<StoreState>()(
  devtools(
    persist(
      (set, get, api) => ({
        // Combine all slices with proper arguments
        ...createChatSlice(set, get, api),
        ...createUiSlice(set, get, api),
        ...createAuthSlice(set, get, api),
        ...createSystemSlice(set, get, api),
      }),
      {
        name: 'chat-storage',
        partialize: (state: StoreState) => {
          const persistedData = {
            // Chat slice
            selectedModel: state.selectedModel,
            messages: state.messages,

            // UI slice
            showTimestamps: state.showTimestamps,
            isExpanded: state.isExpanded,
            hasSeenWelcomeAnimation: state.hasSeenWelcomeAnimation,

            // Auth slice
            hasValidApiKey: state.hasValidApiKey,
            apiKeyType: state.apiKeyType,
            apiKeyLength: state.apiKeyLength,
            hasCompletedInitialSetup: state.hasCompletedInitialSetup,
            lastSuccessfulKeyType: state.lastSuccessfulKeyType,

            // System slice
            isInitialized: state.isInitialized,
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

              // Initialize with welcome message if no messages exist
              if (!state.messages || state.messages.length === 0) {
                const welcomeMessage = createWelcomeMessage();
                state.messages = [welcomeMessage];
              }
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

// 🧪 Isolated test store factories for better testing
export const createChatTestStore = () => create<ChatSlice>()(createChatTestSlice);

export const createUiTestStore = () => create<UiSlice>()(createUiTestSlice);

export const createAuthTestStore = () => create<AuthSlice>()(createAuthTestSlice);

export const createSystemTestStore = () => create<SystemSlice>()(createSystemTestSlice);

// 🧪 Combined test store factory (without persistence for testing)
export const createTestStore = () =>
  create<StoreState>()((set, get, api) => ({
    ...createChatSlice(set, get, api),
    ...createUiSlice(set, get, api),
    ...createAuthSlice(set, get, api),
    ...createSystemSlice(set, get, api),
  }));

// Re-export types for convenience
export type { StoreState, ChatSlice, UiSlice, AuthSlice, SystemSlice } from './store.types';
export type { Message, ActionResult, FormState } from '@/types';

// Legacy support - re-export as ChatState for backward compatibility
export type { ChatState } from './store.types';
