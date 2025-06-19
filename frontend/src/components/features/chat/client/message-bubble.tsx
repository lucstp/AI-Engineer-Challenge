'use client';

import { useMemo } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/store';
import { Bot, User } from 'lucide-react';
import { motion } from 'motion/react';

import type { MessageBubbleProps } from '../chat.types';
import { TypewriterMessage } from './typewriter-message';

/**
 * MessageBubble - Client Component for individual message display
 *
 * Features:
 * - Avatar system with gradient backgrounds for user/assistant differentiation
 * - TypewriterMessage integration for message.animated property
 * - Timestamp tooltips with proper formatting
 * - Responsive design with mobile-first approach
 * - Beautiful glassmorphism styling matching project design
 * - Motion animations for message appearance
 */
export function MessageBubble({
  message,
  isAnimating = false,
  onAnimationComplete,
  showAvatar = true,
  className,
}: MessageBubbleProps) {
  const isBot = message.role === 'assistant';
  const isWelcome = message.id === 'welcome';
  const showTimestamps = useChatStore((state) => state.showTimestamps);

  // Memoized timestamp formatting for performance
  const formattedTime = useMemo(() => {
    if (!showTimestamps || !message.timestamp) {
      return null;
    }

    return {
      short: new Date(message.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      full: new Date(message.timestamp).toLocaleString(),
    };
  }, [message.timestamp, showTimestamps]);

  // Use motion.div if message should be animated, regular div otherwise
  const Container = isAnimating ? motion.div : 'div';
  const containerProps = isAnimating
    ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      }
    : {};

  return (
    <Container
      {...containerProps}
      className={cn(
        'group flex items-start gap-3',
        message.role === 'user' ? 'flex-row-reverse' : '',
        className,
      )}
    >
      {/* Avatar with gradient background */}
      {showAvatar && (
        <Avatar
          className={cn(
            'size-9 transition-transform duration-200 group-hover:scale-105',
            isBot
              ? 'bg-gradient-to-br from-blue-500 to-purple-600'
              : 'bg-gradient-to-br from-emerald-500 to-teal-600',
          )}
        >
          <AvatarFallback
            className={cn(
              'border-none text-white',
              isBot
                ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                : 'bg-gradient-to-br from-emerald-500 to-teal-600',
            )}
          >
            {isBot ? <Bot className="size-5" /> : <User className="size-5" />}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message content and metadata */}
      <div
        className={cn(
          'flex max-w-[85%] flex-col gap-1 sm:max-w-[80%] md:max-w-[70%]',
          message.role === 'user' ? 'items-end' : 'items-start',
        )}
      >
        {/* Message bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-3 font-sans transition-all duration-200',
            // Welcome and assistant messages - no background, just text
            isWelcome || isBot
              ? 'text-white'
              : 'border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-xl hover:bg-white/15',
            // Touch-friendly sizing
            'flex min-h-[44px] items-center',
          )}
        >
          {/* TypewriterMessage integration for bot/welcome messages */}
          {isBot || isWelcome ? (
            <TypewriterMessage
              message={message}
              isAnimating={isAnimating}
              onAnimationComplete={onAnimationComplete}
              className="prose-sm text-white"
            />
          ) : (
            <span className="text-white">{message.content}</span>
          )}
        </div>

        {/* Timestamp tooltip */}
        {formattedTime && (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    'cursor-default px-2 text-xs text-blue-200 opacity-50 transition-opacity hover:opacity-100',
                    message.role === 'user' ? 'text-right' : 'text-left',
                  )}
                >
                  {formattedTime.short}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <p>{formattedTime.full}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </Container>
  );
}
