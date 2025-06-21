'use client';

import { useAnimationState } from '@/hooks/use-animation-state';
import { useChatStore } from '@/store';

/**
 * Animated background with Silicon Valley-grade user experience.
 *
 * Silicon Valley approach:
 * - Render immediately with smart defaults (gray logos for new users)
 * - Smooth transitions when persisted state loads
 * - No loading screens or hydration delays
 * - Seamless state synchronization
 *
 * Features:
 * - Smart default: Show gray logos initially (most users don't have API keys)
 * - Smooth transitions when real state loads from persistence
 * - No hydration mismatch or flashing
 * - Maintains visual stability across page reloads
 *
 * @param children - The content to render above the animated background
 */
export function AnimatedBackground({ children }: { children: React.ReactNode }) {
  const { isRehydrated, hasValidApiKey } = useChatStore();
  const { shouldShowValidAnimation, shouldShowInvalidAnimation, isFirstTimeUser } =
    useAnimationState();

  // Silicon Valley approach: Smart defaults with smooth transitions
  // Before rehydration: always show gray logos (prevents hydration mismatch)
  // After rehydration: show based on actual API key state
  const showValidLogos = isRehydrated && hasValidApiKey;
  const showInvalidLogos = !isRehydrated || !hasValidApiKey;
  const blurIntensity =
    isRehydrated && isFirstTimeUser ? 'backdrop-blur-[2px]' : 'backdrop-blur-[1.5px]';

  return (
    <div className="fixed inset-0 min-h-screen">
      {/* Background with gradient and logo patterns */}
      <div className="absolute inset-0 origin-center [transform:scale(2.5)] bg-gradient-to-bl from-[#0f172a] via-[#1e1a78] to-[#0f172a]">
        {/* Gray logo pattern - smart default, then controlled by state */}
        <div
          className={`absolute inset-0 bg-[url(/assets/logos/aimakerspace-gray-192.png)] bg-[length:192px_192px] bg-center bg-repeat transition-opacity duration-500 ease-in-out ${
            showInvalidLogos ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Yellow logo pattern - hidden by default, shown when API key is valid */}
        <div
          className={`absolute inset-0 bg-[url(/assets/logos/aimakerspace-i-192.png)] bg-[length:192px_192px] bg-center bg-repeat transition-opacity duration-500 ease-in-out ${
            showValidLogos ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Glassmorphism overlay with smart defaults */}
        <div
          className={`absolute inset-0 transition-all duration-500 ease-in-out ${blurIntensity}`}
        />
      </div>

      {/* Content rendered on top of the animated background */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
