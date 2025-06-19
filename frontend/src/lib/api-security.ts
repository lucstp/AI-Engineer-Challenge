/**
 * API Security Utilities
 * Pure functions for sanitizing sensitive data and secure logging
 * Using modern DDD patterns - Pure Utilities & Infrastructure
 */

/**
 * Sanitize strings by removing API keys and other sensitive information
 * Pure function - no side effects, same input always produces same output
 */
export function sanitizeString(str: string): string {
  return (
    str
      // OpenAI API keys (sk-...)
      .replace(/sk-[A-Za-z0-9_-]{48}/g, '[API_KEY_REDACTED]')
      // Generic Bearer tokens
      .replace(/Bearer\s+[A-Za-z0-9_-]+/gi, 'Bearer [TOKEN_REDACTED]')
      // Authorization headers
      .replace(/authorization:\s*[^\s,]+/gi, 'authorization: [AUTH_REDACTED]')
      // API key parameters in URLs or JSON
      .replace(/api[_-]?key["']?\s*[:=]\s*["']?[A-Za-z0-9_-]+/gi, 'api_key: [KEY_REDACTED]')
  );
}

/**
 * Safely log errors without exposing sensitive information
 * Filters out potential API keys, tokens, and other sensitive data
 */
export function logSafeError(context: string, error: unknown): void {
  if (error instanceof Error) {
    // Create a sanitized error object with safe properties
    const safeError = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };

    // Remove potential sensitive data from message and stack
    const sanitizedMessage = sanitizeString(safeError.message);
    const sanitizedStack = safeError.stack ? sanitizeString(safeError.stack) : undefined;

    console.error(context, {
      ...safeError,
      message: sanitizedMessage,
      stack: sanitizedStack,
    });
  } else {
    // For non-Error objects, convert to string and sanitize
    const errorString = sanitizeString(String(error));
    console.error(context, errorString);
  }
}
