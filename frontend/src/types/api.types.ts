/**
 * API Types - Global Types Hub
 * Using modern DDD patterns - Single Source of Truth for all API-related TypeScript interfaces
 */

/**
 * Generic API response wrapper for consistent response handling
 */
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Form state for React 19 useActionState integration
 */
export interface FormState {
  message: string;
  errors?: Record<string, string[]>;
  success?: boolean;
}

/**
 * Chat message form data after Zod validation
 */
export interface ChatFormData {
  message: string;
  model: string;
  apiKey: string;
  developerMessage: string;
}
