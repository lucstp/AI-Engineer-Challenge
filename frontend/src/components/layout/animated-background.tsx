'use client';

import { useAnimationState } from '@/hooks/use-animation-state';
import { useChatStore } from '@/store';

/**
 * Renders an animated, visually rich background with smart defaults and smooth transitions for optimal user experience.
 *
 * The background adapts in real time to app state: gray logos are shown by default for new or unauthenticated users, while yellow logos appear when a valid API key is detected after state rehydration. A dynamic glassmorphism overlay ensures seamless visual transitions and prevents hydration mismatches or flashing.
 *
 * @param children - React nodes to display above the animated background
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
