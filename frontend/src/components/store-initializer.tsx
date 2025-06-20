// src/components/store-initializer.tsx
'use client';

import { useEffect } from 'react';
import { useChatStore } from '@/store';

/**
 * Component to initialize the store on app startup.
 * This ensures proper hydration and session checking.
 */
export function StoreInitializer() {
  const { initializeStore, checkSession, isInitialized } = useChatStore();

  useEffect(() => {
    // Only run initialization once
    if (isInitialized) {
      console.log('⏭️ Store already initialized, skipping');
      return;
    }

    const initialize = async () => {
      console.log('🚀 Starting store initialization...');

      // First initialize the store (handles first-time vs returning user)
      initializeStore();

      // Then check for existing session
      await checkSession();

      console.log('✅ Store initialization complete');
    };

    initialize().catch(console.error);
  }, [initializeStore, checkSession, isInitialized]);

  // This component doesn't render anything
  return null;
}

// Add this to your layout.tsx:
/*
import { StoreInitializer } from '@/components/store-initializer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreInitializer />
        {children}
      </body>
    </html>
  );
}
*/
