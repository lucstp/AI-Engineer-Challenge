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
 * Zod schema for API key validation (OpenAI keys are exactly 51 characters as of 2025)
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
 * Chat message form validation schema
 * Validates all required fields for chat message submission
 */
export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(4000, 'Message too long'),
  model: z.string().min(1, 'Model is required'),
  apiKey: z.string().min(20, 'Valid API key is required'),
  developerMessage: z.string().optional().default('You are a helpful AI assistant.'),
});
