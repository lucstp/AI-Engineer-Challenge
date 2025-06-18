'use client';

import { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatStore } from '@/store';

import type { MessageListProps } from '../chat.types';
import { EmptyState } from './empty-state';
import { TypewriterMessage } from './typewriter-message';
import { TypingIndicator } from './typing-indicator';

/**
 * MessageList - Client Component for message display
 *
 * Features:
 * - Client Component with proper ScrollArea integration
 * - TypewriterMessage integration for animated messages
 * - Beautiful empty state with welcome message
 * - Auto-scroll to bottom on new messages
 * - Typing indicator with motion animations
 * - Integrates with existing Zustand store
 * - Single Responsibility: Only handles message list display and scrolling
 */
export function MessageList({
  messages,
  isTyping,
  animatedContent = '',
  isAnimating,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const [userIsScrolling, setUserIsScrolling] = useState(false);
  const userScrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const setIsAnimating = useChatStore((state) => state.setIsAnimating);

  // Detect user scrolling to respect user control
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      setUserIsScrolling(true);

      // Clear existing timeout
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }

      // Reset user scrolling flag after 1 second of no scroll activity
      userScrollTimeoutRef.current = setTimeout(() => {
        setUserIsScrolling(false);
      }, 1000);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array is correct here - we only want to set up listener once

  // Auto-scroll to bottom on new messages using requestAnimationFrame
  useEffect(() => {
    if (messages.length > 0) {
      // Cancel any pending animation frame
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Schedule scroll on next paint for smooth performance
      animationFrameRef.current = requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: userIsScrolling ? 'auto' : 'smooth',
          block: 'end'
        });
      });

      return () => {
        if (animationFrameRef.current !== undefined) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [messages.length, userIsScrolling]);

  // Show empty state when no messages
  if (messages.length === 0) {
    return <EmptyState />;
  }

  return (
    <ScrollArea className="flex-1 px-2" ref={scrollContainerRef}>
      <div className="space-y-6 py-4">
        {messages.map((message, idx) => {
          const isLastMessage = idx === messages.length - 1;
          // Only show animated content if it's non-empty and isAnimating is true
          const showAnimated =
            isLastMessage &&
            (message.role === 'assistant' || message.id === 'welcome') &&
            isAnimating &&
            animatedContent.length > 0;

          return (
            <div key={message.id} className="flex flex-col space-y-2">
              {/* Message content with TypewriterMessage integration */}
              <div className="flex items-start gap-3">
                <div className="min-w-[80px] text-sm text-blue-200 opacity-70">
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </div>
                <div className="min-w-0 flex-1">
                  <TypewriterMessage
                    message={message}
                    isAnimating={showAnimated}
                    onAnimationComplete={showAnimated ? () => setIsAnimating(false) : undefined}
                    className="text-white"
                  />
                </div>
              </div>

              {/* Timestamp if enabled */}
              {message.showTimestamp && message.timestamp && (
                <div className="ml-[92px] text-xs text-blue-300 opacity-50">
                                    {(() => {
                    const date = new Date(message.timestamp);
                    return !Number.isNaN(date.getTime())
                      ? date.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Invalid time';
                  })()}
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && <TypingIndicator />}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
