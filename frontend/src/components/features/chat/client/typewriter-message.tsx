'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Message } from '@/types';
import { motion } from 'motion/react';

/**
 * Custom hook for typewriter animation with dynamic speed
 */
function useTypewriter(text: string, startAnimation: boolean, speed = 10) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 useTypewriter effect triggered:', {
        startAnimation,
        textLength: text.length,
        text: `${text.substring(0, 30)}...`,
      });
    }

    if (!startAnimation) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⏸️ Animation not started - startAnimation is false');
      }
      return;
    }

    console.log('🚀 Starting typewriter animation');

    // Clear any existing animation
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }

    // Reset state
    setDisplayText('');
    setIsComplete(false);

    let currentIndex = 0;

    // Function to add one character at a time
    const typeNextChar = () => {
      if (currentIndex < text.length) {
        setDisplayText(text.substring(0, currentIndex + 1));
        currentIndex++;

        // Dynamic speed adjustment based on text length
        let charDelay = speed;

        // Faster for longer messages
        if (text.length > 300) {
          charDelay = Math.max(3, speed - 7); // Very fast for very long messages
        } else if (text.length > 200) {
          charDelay = Math.max(5, speed - 5); // Faster for long messages
        } else if (text.length > 100) {
          charDelay = Math.max(7, speed - 3); // Somewhat faster for medium messages
        }

        // Add a very slight randomization for natural feel
        charDelay += Math.random() * 4 - 2;
        charDelay = Math.max(1, charDelay); // never < 1 ms
        charDelay = Math.max(1, charDelay); // never < 1 ms

        // Brief pause at punctuation for natural reading
        const lastChar = text[currentIndex - 1];
        if (lastChar && ['.', '!', '?'].includes(lastChar)) {
          charDelay += 12; // Longer pause at sentence endings
        } else if (lastChar && [',', ';', ':'].includes(lastChar)) {
          charDelay += 8; // Short pause at mid-sentence punctuation
        }

        animationRef.current = setTimeout(typeNextChar, charDelay);
      } else {
        setIsComplete(true);
        animationRef.current = null;
      }
    };

    // Start animation
    animationRef.current = setTimeout(typeNextChar, 0);

    // Cleanup
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [text, startAnimation, speed]);

  return { displayText, isComplete };
}

interface TypewriterMessageProps {
  message: Message;
  className?: string;
  isAnimating?: boolean;
  onAnimationComplete?: () => void;
}

/**
 * TypewriterMessage - Client Component for animated message display
 *
 * Features:
 * - Dynamic typewriter animation with natural pacing
 * - Integration with message.animated property
 * - Speed adjustments based on content length
 * - Natural pauses at punctuation
 * - Callback for animation completion
 */
export function TypewriterMessage({
  message,
  className,
  isAnimating = true,
  onAnimationComplete,
}: TypewriterMessageProps) {
  // Debug logging for animation state
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🎬 TypewriterMessage props:', {
        messageId: message.id,
        isAnimating,
        messageContent: `${message.content.substring(0, 30)}...`,
        messageLength: message.content.length,
      });
    }
  }, [message.id, isAnimating, message.content]);

  // Use our typewriter hook
  const { displayText, isComplete } = useTypewriter(
    message.content,
    isAnimating === true,
    10, // Base speed in ms
  );

  // Debug logging for typewriter state
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔤 Typewriter state:', {
        messageId: message.id,
        displayTextLength: displayText.length,
        totalLength: message.content.length,
        isComplete,
        isAnimating,
      });
    }
  }, [message.id, displayText.length, message.content.length, isComplete, isAnimating]);

  // Call onAnimationComplete when animation finishes
  useEffect(() => {
    if (isComplete && onAnimationComplete) {
      console.log('✅ Animation complete, calling callback');
      onAnimationComplete();
    }
  }, [isComplete, onAnimationComplete]);

  return (
    <div className={cn('prose prose-invert max-w-none', className)}>
      {isAnimating ? <span>{displayText}</span> : <span>{message.content}</span>}
    </div>
  );
}

interface AnimatedMessageContainerProps extends TypewriterMessageProps {
  isTyping?: boolean;
}

/**
 * AnimatedMessageContainer - Enhanced typewriter with cursor animation
 *
 * Features:
 * - Typewriter animation with animated cursor
 * - Motion/react integration following animation patterns
 * - Proper client-side rendering with motion components
 */
export function AnimatedMessageContainer({
  message,
  className,
  isAnimating,
  onAnimationComplete,
  isTyping,
}: AnimatedMessageContainerProps) {
  return (
    <div className={cn('relative', className)}>
      <TypewriterMessage
        message={message}
        isAnimating={isAnimating}
        onAnimationComplete={onAnimationComplete}
      />

      {/* Animated cursor - only shown if isTyping is explicitly true */}
      {isAnimating && isTyping && (
        <motion.div
          className="absolute ml-1 inline-block h-4 w-2 bg-blue-400"
          animate={{ opacity: [1, 0, 1] }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 0.8,
            ease: 'linear',
          }}
          style={{ display: 'inline-block' }}
        />
      )}
    </div>
  );
}
