'use client';

import { useAnimationState } from '@/hooks/use-animation-state';

/**
 * Provides an animated, visually dynamic background with logo transitions and glassmorphism effects.
 *
 * The background responds to secure API key validation state, smoothly transitioning between gray and yellow logo patterns without flickering on page reload. A gradient and glassmorphism overlay enhance visual depth. Prevents flickering during hydration and ensures accessibility by layering content above the animated background.
 *
 * @param children - The content to render above the animated background
 */
export function AnimatedBackground({ children }: { children: React.ReactNode }) {
  const { shouldShowValidAnimation, shouldShowInvalidAnimation, isAnimationReady } = useAnimationState();

  return (
    <div className="fixed inset-0 min-h-screen">
      {/* Background with gradient and logo patterns */}
      <div className="absolute inset-0 origin-center [transform:scale(2.5)] bg-gradient-to-bl from-[#0f172a] via-[#1e1a78] to-[#0f172a]">
        {/* Gray logo pattern - shown when API key is invalid */}
        <div
          className={`absolute inset-0 bg-[url(/assets/logos/aimakerspace-gray-192.png)] bg-[length:192px_192px] bg-center bg-repeat transition-opacity duration-500 ease-in-out ${
            isAnimationReady && shouldShowInvalidAnimation ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Yellow logo pattern - shown when API key is valid */}
        <div
          className={`absolute inset-0 bg-[url(/assets/logos/aimakerspace-i-192.png)] bg-[length:192px_192px] bg-center bg-repeat transition-opacity duration-500 ease-in-out ${
            isAnimationReady && shouldShowValidAnimation ? 'opacity-100' : 'opacity-0'
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
