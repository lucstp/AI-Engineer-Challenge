'use client'

import { useChatStore } from '@/store'
import { useEffect, useState, useRef } from 'react'

/**
 * AnimatedBackground - Infrastructure component providing visual context
 *
 * Features:
 * - Logo animation: Gray → colored based on API key validation
 * - Glassmorphism backdrop-blur effect
 * - Gradient background with beautiful visual effects
 * - Integrates with Zustand store for API key state
 * - Prevents flickering during rehydration
 */
export function AnimatedBackground({ children }: { children: React.ReactNode }) {
  // Get API key validation state from Zustand store
  const { isApiKeyValid, isInitialized } = useChatStore()

  // Local state to prevent flickering during rehydration
  const [logoState, setLogoState] = useState<'valid' | 'invalid'>(() => {
    // Try to initialize from localStorage on first render
    if (typeof window !== 'undefined') {
      try {
        const storedApiKey = localStorage.getItem('OPENAI_API_KEY')
        if (storedApiKey && storedApiKey.trim().length >= 31 && /^sk-[\w-]+$/.test(storedApiKey.trim())) {
          return 'valid'
        }
      } catch (e) {
        console.error('Error reading from localStorage:', e)
      }
    }
    return 'invalid'
  })

  // Track if we've processed the initial state change
  const initialProcessed = useRef(false)

  // Handle API key changes from the store, but only after initialization
  useEffect(() => {
    if (isInitialized) {
      // Update logo only if this isn't the initial state change
      if (initialProcessed.current) {
        setLogoState(isApiKeyValid ? 'valid' : 'invalid')
      } else {
        initialProcessed.current = true
      }
    }
  }, [isApiKeyValid, isInitialized])

  return (
    <div className="fixed inset-0 min-h-screen">
      {/* Background with gradient and logo patterns */}
      <div className="absolute inset-0 origin-center opacity-70 [transform:scale(2.5)] bg-gradient-to-bl from-[#0f172a] via-[#1e1a78] to-[#0f172a]">
        {/* Gray logo pattern - shown when API key is invalid */}
        <div
          className={`absolute inset-0 bg-[url('/images/aimakerspace-gray-192.png')] bg-[length:180px_180px] bg-repeat transition-opacity duration-300 ease-in-out
          ${logoState === 'invalid' ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Colored logo pattern - shown when API key is valid */}
        <div
          className={`absolute inset-0 bg-[url('/images/aimakerspace-i-192.png')] bg-[length:180px_180px] bg-repeat transition-opacity duration-300 ease-in-out
          ${logoState === 'valid' ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Glassmorphism overlay */}
        <div className="fixed inset-0 backdrop-blur-sm -z-10" />
      </div>

      {/* Content rendered on top of the animated background */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
