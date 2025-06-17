'use client';

import { useEffect, useState } from 'react';
import { useChatStore } from '@/store';

/**
 * AnimatedBackground - Infrastructure component providing visual context
 *
 * Features:
 * - Logo animation: Orinal Gray → Yellow based on API key validation
 * - Glassmorphism backdrop-blur effect
 * - Gradient background with beautiful visual effects
 * - Integrates with Zustand store for API key state
 * - Prevents flickering during rehydration
 */
export function AnimatedBackground({ children }: { children: React.ReactNode }) {
  // Get API key validation state from Zustand store
  const { isApiKeyValid, isInitialized } = useChatStore();

  // Local state for smooth transitions
  const [isReady, setIsReady] = useState(false);
  const [logoState, setLogoState] = useState<'valid' | 'invalid'>('invalid');

  // Handle initialization and logo state updates
  useEffect(() => {
    if (isInitialized) {
      // Update logo state based on store
      setLogoState(isApiKeyValid ? 'valid' : 'invalid');

      // Mark as ready for rendering
      if (!isReady) {
        setIsReady(true);
      }
    }
  }, [isInitialized, isApiKeyValid, isReady]);

  // Don't render until store is initialized to prevent flickering
  if (!isReady) {
    return (
      <div className="fixed inset-0 min-h-screen bg-gradient-to-bl from-[#0f172a] via-[#1e1a78] to-[#0f172a]">
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 min-h-screen">
      {/* Background with gradient and logo patterns */}
      <div className="absolute inset-0 origin-center [transform:scale(2.5)] bg-gradient-to-bl from-[#0f172a] via-[#1e1a78] to-[#0f172a]">
        {/* Gray logo pattern - shown when API key is invalid */}
        <div
          className={`absolute inset-0 bg-[url('/images/aimakerspace-gray-192.png')] bg-[length:180px_180px] bg-repeat transition-opacity duration-300 ease-in-out ${logoState === 'invalid' ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Yellow logo pattern - shown when API key is valid */}
        <div
          className={`absolute inset-0 bg-[url('/images/aimakerspace-i-192.png')] bg-[length:180px_180px] bg-repeat transition-opacity duration-300 ease-in-out ${logoState === 'valid' ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Glassmorphism overlay */}
        <div className="fixed inset-0 -z-10 backdrop-blur-sm" />
      </div>

      {/* Content rendered on top of the animated background */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

