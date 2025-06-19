'use client';

import { useEffect } from 'react';
import { ChatInput, MessageList } from '@/components/features/chat';
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

export default function HomePage() {
  const { messages, isInitialized, initializeStore, showTimestamps, setShowTimestamps } =
    useChatStore();

  useEffect(() => {
    if (!isInitialized) {
      initializeStore();
    }
  }, [isInitialized, initializeStore]);

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
          <h1 className="text-2xl font-bold text-white">AI Chat Assistant</h1>
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
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto">
              <MessageList
                messages={messages}
                isLoading={false}
                isTyping={false}
                animatedContent=""
                isAnimating={false}
              />
            </div>
            <ChatInput />
          </div>
        </ChatShell>
      </ChatLayout>
    </AnimatedBackground>
  );
}
