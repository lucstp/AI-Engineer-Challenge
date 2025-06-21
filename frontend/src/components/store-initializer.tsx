// src/components/store-initializer.tsx
'use client';

import { useEffect } from 'react';
import { logger } from '@/lib';
import { useChatStore } from '@/store';

/**
 * Store Initializer - Simple initialization after a brief delay to allow Zustand rehydration
 */
export function StoreInitializer() {
  const { initializeStore, checkSession, isInitialized } = useChatStore();

  useEffect(() => {
    // Give Zustand time to rehydrate, then initialize
    const timer = setTimeout(() => {
      const initialize = async () => {
        logger.debug('🔄 Starting initialization after rehydration delay', {
          component: 'StoreInitializer',
          isInitialized,
        });

        const currentState = useChatStore.getState();

        if (!currentState.isInitialized) {
          logger.info('Initializing store', {
            component: 'StoreInitializer',
            messagesCount: currentState.messages.length,
            hasValidApiKey: currentState.hasValidApiKey,
          });

          initializeStore();
        }

        // Always check session after initialization
        await checkSession();

        logger.success('Initialization complete', {
          component: 'StoreInitializer',
        });
      };

      initialize().catch((error) => {
        logger.error(
          'Initialization failed',
          error instanceof Error ? error : new Error(String(error)),
          {
            component: 'StoreInitializer',
          },
        );
      });
    }, 100); // Small delay to allow Zustand rehydration

    return () => clearTimeout(timer);
  }, [initializeStore, checkSession, isInitialized]); // Include dependencies

  // This component doesn't render anything
  return null;
}

