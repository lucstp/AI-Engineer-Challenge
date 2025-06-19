'use server';

import { cookies } from 'next/headers';
import { decryptApiKey, encryptApiKey } from '@/lib/encryption';
import { modernApiKeySchema, validateOpenAIKeyFormat } from '@/lib/validation';
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

export async function validateAndStoreApiKey(
  apiKey: string,
): Promise<ActionResult<{ success: boolean; keyInfo?: { type: string; length: number } }>> {
  try {
    // 1. Format validation
    const validation = modernApiKeySchema.safeParse(apiKey);
    if (!validation.success) {
      // Safely extract error message with multiple fallbacks
      const errorMessage =
        validation.error?.issues?.[0]?.message ??
        validation.error?.message ??
        'Invalid OpenAI API key format';

      return {
        success: false,
        error: 'Invalid API key format',
        fieldErrors: {
          apiKey: [errorMessage],
        },
      };
    }

    // 2. Get key format details
    const keyInfo = validateOpenAIKeyFormat(apiKey);
    if (!keyInfo.isValid) {
      return {
        success: false,
        error: 'Invalid API key format',
        fieldErrors: { apiKey: ['Key format not recognized'] },
      };
    }

    // 3. Test with OpenAI API (server-side only)
    const testResponse = await fetch('https://api.openai.com/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!testResponse.ok) {
      const errorText = await testResponse.text().catch(() => 'Unknown error');
      console.error('OpenAI API validation failed:', testResponse.status, errorText);

      return {
        success: false,
        error: 'API key validation failed',
        fieldErrors: {
          apiKey: [
            testResponse.status === 401
              ? 'Invalid or expired API key'
              : 'API key verification failed',
          ],
        },
      };
    }

    // 4. Encrypt and store the API key
    const encryptedKey = await encryptApiKey(apiKey);

    // 5. Create secure session
    const sessionData: ApiKeySession = {
      hasValidKey: true,
      keyType: keyInfo.keyType,
      keyLength: keyInfo.length,
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
          type: keyInfo.keyType,
          length: keyInfo.length,
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

export async function deleteApiKeySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('api-session');
  cookieStore.delete('api-key-enc');
}

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
