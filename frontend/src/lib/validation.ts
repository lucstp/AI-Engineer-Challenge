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
 */

// Single source of truth for API key regex pattern
const API_KEY_REGEX = /^sk-[A-Za-z0-9_-]{48}$/;

/**
 * Enhanced OpenAI API key validation with format details
 */
export interface ApiKeyValidationResult {
  isValid: boolean;
  keyType: string;
  length: number;
  error?: string;
}

/**
 * Validate OpenAI key format and return detailed information
 */
export function validateOpenAIKeyFormat(key: string): ApiKeyValidationResult {
  const trimmedKey = key.trim();

  if (!trimmedKey) {
    return {
      isValid: false,
      keyType: 'unknown',
      length: 0,
      error: 'API key is required',
    };
  }

  if (!trimmedKey.startsWith('sk-')) {
    return {
      isValid: false,
      keyType: 'invalid',
      length: trimmedKey.length,
      error: 'OpenAI API keys must start with "sk-"',
    };
  }

  if (trimmedKey.length !== 51) {
    return {
      isValid: false,
      keyType: 'openai',
      length: trimmedKey.length,
      error: `OpenAI API keys must be exactly 51 characters (found ${trimmedKey.length})`,
    };
  }

  if (!API_KEY_REGEX.test(trimmedKey)) {
    return {
      isValid: false,
      keyType: 'openai',
      length: trimmedKey.length,
      error: 'API key contains invalid characters',
    };
  }

  return {
    isValid: true,
    keyType: 'openai',
    length: trimmedKey.length,
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
  .regex(API_KEY_REGEX, 'API key must start with "sk-" and be exactly 51 characters');

/**
 * Checks if a string matches the required API key format.
 *
 * @param key - The string to validate as an API key.
 * @returns `true` if {@link key} matches the API key pattern; otherwise, `false`.
 */
export function isKeyFormatValid(key: string): boolean {
  return API_KEY_REGEX.test(key);
}

// Export regex for potential reuse elsewhere
export { API_KEY_REGEX };

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
