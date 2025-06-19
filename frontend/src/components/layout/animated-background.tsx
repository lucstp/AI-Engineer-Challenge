'use client';

import { useEffect, useState } from 'react';
import { useChatStore } from '@/store';

/**
 * AnimatedBackground - Infrastructure component providing visual context
 *
 * Features:
 * - Logo animation: Gray → Yellow based on secure API key validation
 * - Glassmorphism backdrop-blur effect
 * - Gradient background with beautiful visual effects
 * - Integrates with secure Zustand store (no direct key access)
 * - Prevents flickering during rehydration
 */
export function AnimatedBackground({ children }: { children: React.ReactNode }) {
  const { hasValidApiKey, apiKeyType, apiKeyLength, checkSession, isInitialized } = useChatStore();
  const [logoState, setLogoState] = useState<'valid' | 'invalid'>('invalid');

  // Check session after hydration
  useEffect(() => {
    if (isInitialized) {
      checkSession(); // Safe to call after hydration
    }
  }, [isInitialized, checkSession]);

  // Update logo state
  useEffect(() => {
    const shouldBeValid = hasValidApiKey && apiKeyType && apiKeyLength;
    setLogoState(shouldBeValid ? 'valid' : 'invalid');

    // Only log API key metadata in development environment
    if (process.env.NODE_ENV === 'development' && hasValidApiKey && apiKeyType) {
      console.log(`🔑 Valid ${apiKeyType} key detected (${apiKeyLength} chars)`);
    }
  }, [hasValidApiKey, apiKeyType, apiKeyLength]);

  return (
    <div className="fixed inset-0 min-h-screen">
      {/* Background with gradient and logo patterns */}
      <div className="absolute inset-0 origin-center [transform:scale(2.5)] bg-gradient-to-bl from-[#0f172a] via-[#1e1a78] to-[#0f172a]">
        {/* Gray logo pattern - shown when API key is invalid */}
        <div
          className={`absolute inset-0 bg-[url(/assets/logos/aimakerspace-gray-192.png)] bg-[length:192px_192px] bg-center bg-repeat transition-opacity duration-300 ease-in-out ${
            logoState === 'invalid' ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Yellow logo pattern - shown when API key is valid */}
        <div
          className={`absolute inset-0 bg-[url(/assets/logos/aimakerspace-i-192.png)] bg-[length:192px_192px] bg-center bg-repeat transition-opacity duration-300 ease-in-out ${
            logoState === 'valid' ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      </div>

      {/* Content rendered on top of the animated background */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
