'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { createComponentLogger } from '@/lib';
import type { Message } from '@/types';
import { motion } from 'motion/react';

const logger = createComponentLogger('TypewriterMessage');

// Feature flag for detailed animation debugging - only enable when explicitly needed
const ENABLE_DETAILED_ANIMATION_LOGS =
  process.env.NODE_ENV === 'development' &&
  (process.env.DEBUG_ANIMATIONS === 'true' ||
    (typeof window !== 'undefined' && window?.location?.search?.includes('debug=animations')));

/**
 * Animates a string with a typewriter effect, revealing one character at a time with dynamic speed and natural pauses.
 *
 * The animation speed adapts to the length of the text and introduces brief pauses after punctuation for a more natural typing feel. Animation can be started or stopped via the `startAnimation` flag.
 *
 * @param text - The full string to animate
 * @param startAnimation - Whether to start the animation
 * @param speed - Base typing speed in milliseconds per character (default: 10)
 * @returns An object containing the currently displayed substring (`displayText`) and a boolean indicating if the animation is complete (`isComplete`)
 */
function useTypewriter(text: string, startAnimation: boolean, speed = 10) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only log animation triggers when detailed debugging is enabled
    if (ENABLE_DETAILED_ANIMATION_LOGS) {
      logger.debug('useTypewriter effect triggered', {
        action: 'effect-triggered',
        startAnimation,
        textLength: text.length,
        contentType: text.length > 0 ? 'has-content' : 'empty',
      });
    }

    if (!startAnimation) {
      // Minimal logging for skipped animations
      if (ENABLE_DETAILED_ANIMATION_LOGS) {
        logger.debug('Animation skipped', {
          action: 'animation-skipped',
        });
      }
      return;
    }

    // Log animation start only once per animation, not on every state change
    logger.info('Typewriter animation started', {
      action: 'animation-start',
      textLength: text.length,
    });

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
 * Renders a message with a typewriter animation effect, revealing text character by character.
 *
 * Displays the animated message content if `isAnimating` is true; otherwise, shows the full message instantly. Invokes an optional callback when the animation completes. The animation speed adapts to message length and includes natural pauses at punctuation for a more lifelike effect.
 *
 * @param message - The message object containing the text to display and a unique identifier.
 * @param className - Optional CSS class for custom styling.
 * @param isAnimating - Whether to animate the message display. Defaults to true.
 * @param onAnimationComplete - Optional callback invoked when the animation finishes.
 */
export function TypewriterMessage({
  message,
  className,
  isAnimating = true,
  onAnimationComplete,
}: TypewriterMessageProps) {
  // Conditional debug logging for animation state - only when detailed debugging is enabled
  useEffect(() => {
    if (ENABLE_DETAILED_ANIMATION_LOGS) {
      logger.debug('TypewriterMessage props received', {
        action: 'props-received',
        messageId: message.id,
        isAnimating,
        messageLength: message.content.length,
        messageRole: message.role,
      });
    }
  }, [message.id, isAnimating, message.content, message.role]);

  // Use our typewriter hook
  const { displayText, isComplete } = useTypewriter(
    message.content,
    isAnimating === true,
    10, // Base speed in ms
  );

  // Conditional debug logging for typewriter state - only log significant state changes
  useEffect(() => {
    // Only log completion or when detailed debugging is enabled
    if (isComplete) {
      logger.info('Typewriter animation completed', {
        action: 'animation-completed',
        messageId: message.id,
        finalLength: displayText.length,
      });
    } else if (ENABLE_DETAILED_ANIMATION_LOGS && displayText.length % 50 === 0) {
      // In debug mode, only log every 50 characters to reduce noise
      logger.debug('Typewriter progress update', {
        action: 'progress-update',
        messageId: message.id,
        progressPercent:
          message.content.length > 0
            ? Math.round((displayText.length / message.content.length) * 100)
            : 0,
      });
    }
  }, [message.id, displayText.length, message.content.length, isComplete]);

  // Call onAnimationComplete when animation finishes
  useEffect(() => {
    if (isComplete && onAnimationComplete) {
      // Only log callback execution when detailed debugging is enabled
      if (ENABLE_DETAILED_ANIMATION_LOGS) {
        logger.debug('Animation complete, executing callback', {
          action: 'callback-execution',
          messageId: message.id,
        });
      }
      onAnimationComplete();
    }
  }, [isComplete, onAnimationComplete, message.id]);

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
