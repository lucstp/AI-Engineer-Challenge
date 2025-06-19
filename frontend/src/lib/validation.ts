/**
 * Validation Schemas
 * Zod schemas and validation logic
 * Following Silicon Valley DDD - Pure Utilities & Infrastructure
 */

import { z } from 'zod';

/**
 * API Key Validation Utilities
 *
 * Centralized validation logic for OpenAI API keys
 * Updated to support all 2024-2025 OpenAI key formats
 */

// Legacy API key pattern (exactly 51 chars)
const LEGACY_API_KEY_REGEX = /^sk-[A-Za-z0-9]{48}$/;

// Modern API key pattern with T3BlbkFJ signature (2024-2025)
const MODERN_API_KEY_REGEX =
  /^sk-(?:proj-|svcacct-|admin-)?[A-Za-z0-9_-]{20,74}T3BlbkFJ[A-Za-z0-9_-]{20,74}$/;

/**
 * Enhanced OpenAI API key validation with format details
 */
export interface ApiKeyValidationResult {
  isValid: boolean;
  keyType: string;
  length: number;
  format?: 'legacy' | 'project' | 'service' | 'admin' | 'modern';
  error?: string;
}

/**
 * Get detailed key type information for better user feedback
 */
export function getKeyType(key: string): string {
  if (key.startsWith('sk-proj-s-')) {
    return 'Project Service';
  }
  if (key.startsWith('sk-proj-')) {
    return 'Project';
  }
  if (key.startsWith('sk-svcacct-')) {
    return 'Service Account';
  }
  if (key.startsWith('sk-admin-')) {
    return 'Admin';
  }
  return 'Legacy';
}

/**
 * Validate OpenAI key format and return detailed information
 * Supports all current OpenAI key formats (2024-2025)
 */
export function validateOpenAIKeyFormat(key: string): ApiKeyValidationResult {
  if (!key || typeof key !== 'string') {
    return {
      isValid: false,
      keyType: 'unknown',
      length: 0,
      error: 'API key is required and must be a string',
    };
  }

  const trimmedKey = key.trim();

  if (!trimmedKey.startsWith('sk-')) {
    return {
      isValid: false,
      keyType: 'invalid',
      length: trimmedKey.length,
      error: 'OpenAI API keys must start with "sk-"',
    };
  }

  // Check for modern format with T3BlbkFJ signature
  if (MODERN_API_KEY_REGEX.test(trimmedKey)) {
    const format = trimmedKey.startsWith('sk-proj-')
      ? 'project'
      : trimmedKey.startsWith('sk-svcacct-')
        ? 'service'
        : trimmedKey.startsWith('sk-admin-')
          ? 'admin'
          : 'modern';

    return {
      isValid: true,
      keyType: getKeyType(trimmedKey),
      length: trimmedKey.length,
      format,
    };
  }

  // Check for legacy format (exactly 51 chars)
  if (LEGACY_API_KEY_REGEX.test(trimmedKey)) {
    return {
      isValid: true,
      keyType: 'Legacy',
      length: trimmedKey.length,
      format: 'legacy',
    };
  }

  // Invalid format
  return {
    isValid: false,
    keyType: 'invalid',
    length: trimmedKey.length,
    error:
      'Invalid OpenAI API key format. Keys should start with "sk-", "sk-proj-", or "sk-svcacct-"',
  };
}

/**
 * Modern Zod schema for API key validation with enhanced error messages
 */
export const modernApiKeySchema = z
  .string()
  .min(1, 'API key is required')
  .refine(
    (key) => validateOpenAIKeyFormat(key).isValid,
    (key) => ({
      message: validateOpenAIKeyFormat(key).error || 'Invalid API key format',
    }),
  );

/**
 * Legacy Zod schema for API key validation (OpenAI keys are exactly 51 characters)
 * @deprecated Use modernApiKeySchema instead
 */
export const apiKeySchema = z
  .string()
  .regex(LEGACY_API_KEY_REGEX, 'API key must start with "sk-" and be exactly 51 characters');

/**
 * Checks if a string matches any valid OpenAI API key format.
 *
 * @param key - The string to validate as an API key.
 * @returns `true` if {@link key} matches any valid OpenAI API key pattern; otherwise, `false`.
 */
export function isKeyFormatValid(key: string): boolean {
  return validateOpenAIKeyFormat(key).isValid;
}

// Export regex patterns for potential reuse elsewhere
export { LEGACY_API_KEY_REGEX, MODERN_API_KEY_REGEX };

/**
 * Enhanced Error Messages for User-Friendly Feedback
 */
export const ERROR_MESSAGES = {
  INVALID_FORMAT: {
    title: 'Invalid format',
    description: 'API key should start with "sk-", "sk-proj-", or "sk-svcacct-".',
    action: 'Double-check your API key from the OpenAI dashboard.',
  },
  UNAUTHORIZED: {
    title: 'Invalid API key',
    description: 'The API key is not valid or has been revoked.',
    action: 'Generate a new API key from your OpenAI account.',
  },
  RATE_LIMITED: {
    title: 'Too many requests',
    description: 'Validation requests are being rate limited.',
    action: 'Please wait a moment before trying again.',
  },
  INSUFFICIENT_QUOTA: {
    title: 'Quota exceeded',
    description: 'Your API key has exceeded its usage quota.',
    action: 'Check your billing settings or upgrade your plan.',
  },
  NETWORK_ERROR: {
    title: 'Network error',
    description: 'Unable to validate API key due to network issues.',
    action: 'Check your internet connection and try again.',
  },
} as const;

/**
 * Get error details based on error message content
 */
export function getErrorDetails(error: string): {
  title: string;
  description: string;
  action?: string;
} {
  if (error.includes('rate limit') || error.includes('429')) {
    return ERROR_MESSAGES.RATE_LIMITED;
  }
  if (
    error.includes('unauthorized') ||
    error.includes('401') ||
    error.includes('Invalid API key')
  ) {
    return ERROR_MESSAGES.UNAUTHORIZED;
  }
  if (error.includes('quota') || error.includes('billing')) {
    return ERROR_MESSAGES.INSUFFICIENT_QUOTA;
  }
  if (error.includes('format') || error.includes('Invalid format')) {
    return ERROR_MESSAGES.INVALID_FORMAT;
  }
  if (error.includes('network') || error.includes('fetch')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  return {
    title: 'Validation Error',
    description: error,
    action: 'Please try again or check your API key.',
  };
}

/**
 * Enhanced chat message form validation schema for secure implementation
 */
export const secureChatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(4000, 'Message too long'),
  model: z.string().min(1, 'Model is required'),
  developerMessage: z.string().optional().default('You are a helpful AI assistant.'),
});

/**
 * Chat message form validation schema
 * @deprecated Use secureChatMessageSchema instead - API key should not be in form data
 */
export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(4000, 'Message too long'),
  model: z.string().min(1, 'Model is required'),
  apiKey: z.string().min(20, 'Valid API key is required'),
  developerMessage: z.string().optional().default('You are a helpful AI assistant.'),
});

/**
 * Server Action API key validation schema
 */
export const apiKeyValidationSchema = z.object({
  apiKey: modernApiKeySchema,
});
