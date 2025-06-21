'use client';

import { useEffect, useState } from 'react';
import { useChatStore } from '@/store';

interface DebugInfo {
  messages: number;
  apiKey: boolean;
  isInitialized: boolean;
  hasSeenWelcome: boolean;
  localStorage: string | null;
  parsedStorage: {
    state?: {
      messages?: unknown[];
      hasSeenWelcomeAnimation?: boolean;
      isInitialized?: boolean;
    };
  } | null;
}

export function SessionDebug() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    messages: 0,
    apiKey: false,
    isInitialized: false,
    hasSeenWelcome: false,
    localStorage: null,
    parsedStorage: null,
  });

  const { messages, hasValidApiKey, isInitialized, hasSeenWelcomeAnimation } = useChatStore();

  useEffect(() => {
    // Get localStorage data
    const storageData = typeof window !== 'undefined' ? localStorage.getItem('chat-storage') : null;
    let parsedData = null;

    if (storageData) {
      try {
        parsedData = JSON.parse(storageData);
      } catch (e) {
        console.error('Failed to parse localStorage:', e);
      }
    }

    setDebugInfo({
      messages: messages.length,
      apiKey: hasValidApiKey,
      isInitialized,
      hasSeenWelcome: hasSeenWelcomeAnimation,
      localStorage: storageData,
      parsedStorage: parsedData,
    });
  }, [messages, hasValidApiKey, isInitialized, hasSeenWelcomeAnimation]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm rounded-lg bg-black/80 p-3 font-mono text-base text-white">
      <div className="mb-2 font-bold">🐛 Debug Info</div>
      <div>Messages: {debugInfo.messages}</div>
      <div>API Key: {debugInfo.apiKey ? '✅ Yes' : '❌ No'}</div>
      <div>Initialized: {debugInfo.isInitialized ? '✅ Yes' : '❌ No'}</div>
      <div>Seen Welcome: {debugInfo.hasSeenWelcome ? '✅ Yes' : '❌ No'}</div>

      <div className="mt-2 border-t border-gray-600 pt-2">
        <div className="font-bold">LocalStorage:</div>
        {debugInfo.localStorage ? (
          <div className="max-h-32 overflow-y-auto text-base">
            <div>Has Data: ✅ Yes</div>
            {debugInfo.parsedStorage && (
              <>
                <div>Stored Messages: {debugInfo.parsedStorage.state?.messages?.length || 0}</div>
                <div>
                  Stored hasSeenWelcome:{' '}
                  {debugInfo.parsedStorage.state?.hasSeenWelcomeAnimation ? '✅' : '❌'}
                </div>
                <div>
                  Stored isInitialized: {debugInfo.parsedStorage.state?.isInitialized ? '✅' : '❌'}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-red-400">❌ No Data</div>
        )}
      </div>
    </div>
  );
}
