/**
 * API Client Utilities
 * Pure functions for secure HTTP requests with timeout and error handling
 * Using modern DDD patterns - Pure Utilities & Infrastructure
 */

import { logSafeError, sanitizeString } from './api-security';

/**
 * Configuration for secure fetch requests
 */
export interface SecureFetchOptions extends RequestInit {
  /** Timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Whether to sanitize error messages (default: true) */
  sanitizeErrors?: boolean;
}

/**
 * Secure fetch with timeout and error sanitization
 * Handles AbortController, timeout, and comprehensive error parsing
 */
export async function secureFetch(
  url: string,
  options: SecureFetchOptions = {},
): Promise<Response> {
  const { timeout = 30000, sanitizeErrors = true, ...fetchOptions } = options;

  // Create AbortController for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Make request with timeout
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      // Always fetch fresh data for API requests
      cache: 'no-store',
    });

    // Clear timeout if request succeeds
    clearTimeout(timeoutId);

    // Handle non-OK responses with detailed error parsing
    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response, sanitizeErrors);
      throw new Error(errorMessage);
    }

    return response;
  } catch (fetchError) {
    // Clear timeout in case of error
    clearTimeout(timeoutId);

    // Handle timeout specifically
    if (fetchError instanceof Error && fetchError.name === 'AbortError') {
      throw new Error('Request timeout: The server took too long to respond. Please try again.');
    }

    // Re-throw other fetch errors
    throw fetchError;
  }
}

/**
 * Parse error response and extract meaningful error messages
 * Sanitizes sensitive information from error responses
 */
async function parseErrorResponse(response: Response, sanitize = true): Promise<string> {
  let errorMessage = `HTTP error! status: ${response.status}`;

  try {
    const errorData = await response.json();
    // Extract error message from common API response formats
    if (errorData.error) {
      errorMessage = errorData.error;
    } else if (errorData.message) {
      errorMessage = errorData.message;
    } else if (errorData.detail) {
      // FastAPI typically uses 'detail' for error messages
      errorMessage = errorData.detail;
    } else if (typeof errorData === 'string') {
      errorMessage = errorData;
    }
  } catch (parseError) {
    // If JSON parsing fails, try to get text response
    try {
      const errorText = await response.text();
      if (errorText) {
        errorMessage = errorText;
      }
    } catch (textError) {
      // Keep the original HTTP error message if parsing fails
      logSafeError('Failed to parse error response:', textError);
    }
  }

  // Sanitize error message if requested
  return sanitize ? sanitizeString(errorMessage) : errorMessage;
}
