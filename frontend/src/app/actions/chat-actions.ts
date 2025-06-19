'use server';

import type { ActionResult } from '@/types';

import { getApiKeySession, getDecryptedApiKey } from './api-key-actions';

export interface FormState {
  success: boolean;
  message?: string;
  streamingResponse?: ReadableStream;
  errors?: {
    message?: string[];
    apiKey?: string[];
  };
}

/**
 * Sends a chat message securely using a server action and returns a streaming response.
 *
 * Validates the user's API key session and message input, retrieves the decrypted API key, and sends the message to a FastAPI backend. Returns a `FormState` indicating success or failure, including any validation errors or a streaming response for successful requests.
 *
 * @param _prevState - The previous form state (unused)
 * @param formData - The form data containing the chat message and optional parameters
 * @returns A `FormState` object with success status, error messages, and optionally a streaming response
 */
export async function sendMessageAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    // 1. Verify session exists (SECURE)
    const session = await getApiKeySession();
    if (!session?.hasValidKey) {
      return {
        success: false,
        errors: { apiKey: ['API key session expired. Please re-authenticate.'] },
      };
    }

    // 2. Get decrypted API key (SECURE - server-side only)
    const apiKey = await getDecryptedApiKey();
    if (!apiKey) {
      return {
        success: false,
        errors: { apiKey: ['Failed to retrieve API key. Please re-authenticate.'] },
      };
    }

    // 3. Extract form data
    const message = formData.get('message') as string;
    const model = (formData.get('model') as string) || 'gpt-4o-mini';
    const developerMessage =
      (formData.get('developerMessage') as string) || 'You are a helpful AI assistant.';

    // 4. Validate inputs
    if (!message?.trim()) {
      return {
        success: false,
        errors: { message: ['Message is required'] },
      };
    }

    if (message.length > 4000) {
      return {
        success: false,
        errors: { message: ['Message too long (max 4000 characters)'] },
      };
    }

    // 5. CHALLENGE COMPLIANT: Call FastAPI backend with streaming
    const apiUrl = process.env.API_URL || 'http://localhost:8000';

    const response = await fetch(`${apiUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        developer_message: developerMessage,
        user_message: message.trim(),
        model,
        api_key: apiKey, // SECURE: Only sent server-to-server
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('FastAPI backend error:', response.status, errorText);

      return {
        success: false,
        errors: {
          message: [
            response.status === 401
              ? 'Invalid API key. Please re-authenticate.'
              : `Backend error: ${response.status}`,
          ],
        },
      };
    }

    // 6. MODERN: Return streaming response directly from Server Action
    return {
      success: true,
      message: 'Message sent successfully',
      streamingResponse: response.body || undefined,
    };
  } catch (error) {
    console.error('Send message action error:', error);
    return {
      success: false,
      errors: { message: ['Failed to send message. Please try again.'] },
    };
  }
}

/**
 * Checks if the provided API key matches the expected format.
 *
 * @deprecated Use validateAndStoreApiKey from api-key-actions instead.
 * @param apiKey - The API key string to validate
 * @returns An ActionResult containing `true` if the API key format is valid, otherwise `false`
 */
export async function validateApiKeyAction(apiKey: string): Promise<ActionResult<boolean>> {
  console.warn(
    'validateApiKeyAction is deprecated. Use validateAndStoreApiKey from api-key-actions instead.',
  );

  try {
    // Basic format check only - no actual validation
    const isValidFormat = /^sk-[A-Za-z0-9_-]{48}$/.test(apiKey.trim());

    return {
      success: true,
      data: isValidFormat,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Validation error',
    };
  }
}

/**
 * Test API key with a simple request
 * Optional server action for more thorough validation
 */
export async function testApiKeyAction(apiKey: string): Promise<ActionResult<boolean>> {
  try {
    // This would make a test request to OpenAI API
    // For now, we'll just do format validation
    const formatResult = await validateApiKeyAction(apiKey);

    if (!formatResult.success || !formatResult.data) {
      return {
        success: false,
        error: 'Invalid API key format',
      };
    }

    // TODO: Implement actual API key testing with OpenAI
    // const testResponse = await openai.models.list();

    return {
      success: true,
      data: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'API key test failed',
    };
  }
}
