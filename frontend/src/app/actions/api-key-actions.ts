'use server';

import { cookies } from 'next/headers';
import { decryptApiKey, encryptApiKey } from '@/lib/encryption';
import {
  ERROR_MESSAGES,
  getErrorDetails,
  modernApiKeySchema,
  validateOpenAIKeyFormat,
} from '@/lib/validation';
import type { ActionResult } from '@/types';
import { jwtVerify, SignJWT, type JWTPayload } from 'jose';

const getSessionSecret = (): Uint8Array => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is required');
  }
  return new TextEncoder().encode(secret);
};

interface ApiKeySession extends JWTPayload {
  hasValidKey: boolean;
  keyType: string;
  keyLength: number;
  expiresAt: number;
}

/**
 * Validates an OpenAI API key, verifies it with the OpenAI API, and securely stores it in encrypted cookies along with a JWT session token.
 *
 * Performs multi-step validation including format checks, schema validation, and a live API request to ensure the key is valid and active. On success, the API key is encrypted and stored in an HTTP-only cookie, and a session token containing key metadata is set. Returns detailed error information if validation fails.
 *
 * @param apiKey - The OpenAI API key to validate and store
 * @returns An object indicating success or failure, with key metadata on success or error details on failure
 */
export async function validateAndStoreApiKey(
  apiKey: string,
): Promise<
  ActionResult<{ success: boolean; keyInfo?: { type: string; length: number; format?: string } }>
> {
  try {
    // 1. Enhanced format validation with specific error messages
    const formatValidation = validateOpenAIKeyFormat(apiKey);
    if (!formatValidation.isValid) {
      const errorDetails = getErrorDetails(formatValidation.error || 'Invalid format');
      return {
        success: false,
        error: errorDetails.description,
        fieldErrors: {
          apiKey: [errorDetails.action || 'Please check your API key format'],
        },
      };
    }

    // 2. Zod schema validation as secondary check
    const validation = modernApiKeySchema.safeParse(apiKey);
    if (!validation.success) {
      const errorMessage = validation.error?.issues?.[0]?.message ?? 'Invalid API key format';
      return {
        success: false,
        error: ERROR_MESSAGES.INVALID_FORMAT.description,
        fieldErrors: {
          apiKey: [ERROR_MESSAGES.INVALID_FORMAT.action],
        },
      };
    }

    // 3. Enhanced OpenAI API test with timeout and proper error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const testResponse = await fetch('https://api.openai.com/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!testResponse.ok) {
      const errorText = await testResponse.text().catch(() => 'Unknown error');
      console.error('OpenAI API validation failed:', testResponse.status, errorText);

      // Enhanced error handling with specific messages
      let errorDetails: { title: string; description: string; action: string };
      if (testResponse.status === 401) {
        errorDetails = ERROR_MESSAGES.UNAUTHORIZED;
      } else if (testResponse.status === 429) {
        errorDetails = ERROR_MESSAGES.RATE_LIMITED;
      } else if (testResponse.status === 403) {
        errorDetails = ERROR_MESSAGES.INSUFFICIENT_QUOTA;
      } else {
        errorDetails = {
          title: 'Validation Failed',
          description: `API validation failed (${testResponse.status})`,
          action: 'Please check your API key and try again.',
        };
      }

      return {
        success: false,
        error: errorDetails.description,
        fieldErrors: {
          apiKey: [errorDetails.action],
        },
      };
    }

    // 4. Encrypt and store the API key
    const encryptedKey = await encryptApiKey(apiKey);

    // 5. Create secure session
    const sessionData: ApiKeySession = {
      hasValidKey: true,
      keyType: formatValidation.keyType,
      keyLength: formatValidation.length,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };

    const sessionToken = await new SignJWT(sessionData)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(getSessionSecret());

    // 6. Store in secure httpOnly cookies
    const cookieStore = await cookies();

    cookieStore.set('api-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    cookieStore.set('api-key-enc', encryptedKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return {
      success: true,
      data: {
        success: true,
        keyInfo: {
          type: formatValidation.keyType,
          length: formatValidation.length,
          format: formatValidation.format,
        },
      },
    };
  } catch (error) {
    console.error('API key validation error:', error);
    return {
      success: false,
      error: 'Failed to validate API key',
    };
  }
}

/**
 * Retrieves and verifies the current API key session from cookies.
 *
 * Returns the decoded session payload if a valid, unexpired JWT session token is present; otherwise, returns null.
 */
export async function getApiKeySession(): Promise<ApiKeySession | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('api-session')?.value;

    if (!sessionToken) {
      return null;
    }

    const { payload } = await jwtVerify(sessionToken, getSessionSecret());
    const session = payload as ApiKeySession;

    // Check if session is expired (defensive check)
    if (session?.expiresAt && session.expiresAt < Date.now()) {
      await deleteApiKeySession();
      return null;
    }

    return session;
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}

/**
 * Deletes the API key session and encrypted API key cookies, effectively logging out the user and removing stored credentials.
 */
export async function deleteApiKeySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('api-session');
  cookieStore.delete('api-key-enc');
}

/**
 * Retrieves and decrypts the stored OpenAI API key if a valid session exists.
 *
 * @returns The decrypted API key, or `null` if no valid session or key is found.
 */
export async function getDecryptedApiKey(): Promise<string | null> {
  try {
    const session = await getApiKeySession();
    if (!session?.hasValidKey) {
      return null;
    }

    const cookieStore = await cookies();
    const encryptedKey = cookieStore.get('api-key-enc')?.value;
    if (!encryptedKey) {
      return null;
    }

    return await decryptApiKey(encryptedKey);
  } catch (error) {
    console.error('Failed to decrypt API key:', error);
    return null;
  }
}
