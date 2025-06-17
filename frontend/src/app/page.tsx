'use client';

import { useEffect } from 'react';
import { AnimatedBackground, ChatLayout, ChatShell } from '@/components/layout';
import {
  Avatar,
  AvatarFallback,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import { useChatStore } from '@/store';
import { Bot, Clock, Sparkles } from 'lucide-react';

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
      <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-white">Chat Store Status</h2>
        <div className="mt-2 space-y-2 text-sm text-blue-100">
          <p>Initialized: {isInitialized ? '✅' : '❌'}</p>
          <p>API Key: {apiKey ? '✅ Set' : '❌ Not set'}</p>
          <p>API Key Valid: {isApiKeyValid ? '✅' : '❌'}</p>
          <p>Messages: {messages.length}</p>
        </div>
      </div>

      <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
        <h3 className="font-medium text-white">Phase 3 Started ✅</h3>
        <p className="mt-1 text-sm text-blue-200">
          Animated background active, beautiful styling foundation ready.
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  // Get timestamp state from store
  const { showTimestamps, setShowTimestamps } = useChatStore();

  // Handler for toggling timestamps (using functional approach to avoid stale state)
  const onToggleTimestamps = () => {
    setShowTimestamps((prev) => !prev);
  };

  const headerContent = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="size-14 bg-gradient-to-br from-blue-500 to-purple-600">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <Bot className="size-9" />
            </AvatarFallback>
          </Avatar>
          <div className="absolute top-0 right-0">
            <Sparkles className="h-4 w-4 animate-pulse text-yellow-300" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Assistant</h1>
          <p className="text-sm text-yellow-300">Always ready to help</p>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-3">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <Clock className="size-5 shrink-0 text-white" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleTimestamps}
                  className="!h-10 !max-h-10 w-[85px] !rounded-2xl px-2 py-1 text-xs text-white hover:bg-transparent hover:text-yellow-300"
                >
                  {showTimestamps ? 'Hide Times' : 'Show Times'}
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p>Toggle message timestamps</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );

  const footerContent = (
    <div className="text-center">
      <p className="text-xs text-blue-200">
        Enterprise Architecture • Next.js 15 + React 19 + Zustand
      </p>
    </div>
  );

  return (
    <AnimatedBackground>
      <ChatLayout header={headerContent} footer={footerContent}>
        <ChatShell>
          <ChatDemo />
        </ChatShell>
      </ChatLayout>
    </AnimatedBackground>
  );
}
