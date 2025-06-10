'use client';

import { useEffect } from 'react';
import { ChatLayout, ChatShell } from '@/components/layout';
import { useChatStore } from '@/store';

/**
 * Basic chat demo component showing Zustand integration.
 * Phase 3 will replace this with full chat interface.
 */
function ChatDemo() {
  const { messages, isInitialized, initializeStore, apiKey, isApiKeyValid } = useChatStore();

  useEffect(() => {
    if (!isInitialized) {
      initializeStore();
    }
  }, [isInitialized, initializeStore]);

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Chat Store Status</h2>
        <div className="mt-2 space-y-2 text-sm">
          <p>Initialized: {isInitialized ? '✅' : '❌'}</p>
          <p>API Key: {apiKey ? '✅ Set' : '❌ Not set'}</p>
          <p>API Key Valid: {isApiKeyValid ? '✅' : '❌'}</p>
          <p>Messages: {messages.length}</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-4">
        <h3 className="font-medium">Phase 2 Complete ✅</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Zustand store active, layout foundation ready for Phase 3 styling.
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const headerContent = (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-semibold">AI Chat Application</h1>
      <p className="text-muted-foreground text-sm">Phase 2: Foundation</p>
    </div>
  );

  const footerContent = (
    <div className="text-center">
      <p className="text-muted-foreground text-xs">
        Enterprise Architecture • Next.js 15 + React 19 + Zustand
      </p>
    </div>
  );

  return (
    <ChatLayout header={headerContent} footer={footerContent}>
      <ChatShell>
        <ChatDemo />
      </ChatShell>
    </ChatLayout>
  );
}
