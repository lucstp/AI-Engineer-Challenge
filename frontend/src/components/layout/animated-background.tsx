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
  const { isApiKeyValid, apiKey } = useChatStore();

  // Force logo to start as invalid and only change after explicit user action
  const [logoState, setLogoState] = useState<'valid' | 'invalid'>('invalid');

  // Only update logo state when we have a definitive change in API key validation
  useEffect(() => {
    // Only show valid state if we have both a non-empty API key AND it's valid
    const shouldBeValid = Boolean(apiKey?.trim()) && isApiKeyValid;
    setLogoState(shouldBeValid ? 'valid' : 'invalid');
  }, [apiKey, isApiKeyValid]);

  return (
    <div className="fixed inset-0 min-h-screen">
      {/* Background with gradient and logo patterns */}
      <div className="absolute inset-0 origin-center [transform:scale(2.5)] bg-gradient-to-bl from-[#0f172a] via-[#1e1a78] to-[#0f172a]">
        {/* Gray logo pattern - shown when API key is invalid */}
        <div
          className={`absolute inset-0 bg-[url('/assets/logos/aimakerspace-gray-192.png')] bg-[length:192px_192px] bg-center bg-repeat transition-opacity duration-300 ease-in-out ${logoState === 'invalid' ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Yellow logo pattern - shown when API key is valid */}
        <div
          className={`absolute inset-0 bg-[url('/assets/logos/aimakerspace-i-192.png')] bg-[length:192px_192px] bg-center bg-repeat transition-opacity duration-300 ease-in-out ${logoState === 'valid' ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      </div>

      {/* Content rendered on top of the animated background */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
