'use client';

import { useAnimationState } from '@/hooks/use-animation-state';

/**
 * Animated background with enhanced animation control and stability.
 *
 * Key improvements:
 * - Enhanced animation state integration
 * - Stable transitions without flickering
 * - Consistent animation behavior for all users
 * - No hydration delays or loading states
 *
 * Features:
 * - No hydration waiting - renders immediately
 * - Uses localStorage-based flags for instant state
 * - Clean animation transitions without loading states
 * - Maintains visual stability across page reloads
 *
 * @param children - The content to render above the animated background
 */
export function AnimatedBackground({ children }: { children: React.ReactNode }) {
  const {
    shouldShowValidAnimation,
    shouldShowInvalidAnimation,
    isFirstTimeUser,
    isReturningUser,
    isHydrationComplete,
  } = useAnimationState();

  // Always render immediately - no hydration checks needed for background
  return (
    <div className="fixed inset-0 min-h-screen">
      {/* Background with gradient and logo patterns */}
      <div className="absolute inset-0 origin-center [transform:scale(2.5)] bg-gradient-to-bl from-[#0f172a] via-[#1e1a78] to-[#0f172a]">
        {/* Gray logo pattern - shown when API key is invalid */}
        <div
          className={`absolute inset-0 bg-[url(/assets/logos/aimakerspace-gray-192.png)] bg-[length:192px_192px] bg-center bg-repeat transition-opacity duration-500 ease-in-out ${
            shouldShowInvalidAnimation ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Yellow logo pattern - shown when API key is valid */}
        <div
          className={`absolute inset-0 bg-[url(/assets/logos/aimakerspace-i-192.png)] bg-[length:192px_192px] bg-center bg-repeat transition-opacity duration-500 ease-in-out ${
            shouldShowValidAnimation ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Glassmorphism overlay with dynamic intensity based on user type */}
        <div
          className={`absolute inset-0 transition-all duration-500 ease-in-out ${
            isFirstTimeUser ? 'backdrop-blur-[2px]' : 'backdrop-blur-[1.5px]'
          }`}
        />
      </div>

      {/* Content rendered on top of the animated background */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
