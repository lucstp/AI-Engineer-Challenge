'use server';

import { secureFetch } from '@/lib/api-client';
import { logSafeError, sanitizeString } from '@/lib/api-security';
import { chatMessageSchema, isKeyFormatValid } from '@/lib/validation';
import type { ActionResult, FormState } from '@/types';

/**
 * Send a chat message to the FastAPI backend
 * Using modern Next.js 15 Server Action patterns with React 19 useActionState
 */
export async function sendMessageAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    // Extract and validate form data
    const rawData = {
      message: formData.get('message') as string,
      model: formData.get('model') as string,
      apiKey: formData.get('apiKey') as string,
      developerMessage: formData.get('developerMessage') as string,
    };

    // Validate with Zod
    const validation = chatMessageSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        message: 'Validation failed',
        success: false,
        errors: validation.error.flatten().fieldErrors,
      };
    }

    const { message, model, apiKey, developerMessage } = validation.data;

    // Get API URL from server-only environment variables
    const apiUrl = process.env.API_URL || '/api';

    // Make secure request to FastAPI backend
    await secureFetch(`${apiUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({
        developer_message: developerMessage,
        user_message: message,
        model,
        api_key: apiKey,
      }),
      timeout: 30000, // 30 second timeout
    });

    // For now, just return success - streaming will be handled separately
    return {
      message: 'Message sent successfully',
      success: true,
    };
  } catch (error) {
    logSafeError('Chat action error:', error);

    return {
      message: error instanceof Error ? sanitizeString(error.message) : 'Unknown error occurred',
      success: false,
    };
  }
}

/**
 * Validate API key format
 * Quick validation server action for immediate feedback
 */
export async function validateApiKeyAction(apiKey: string): Promise<ActionResult<boolean>> {
  try {
    const isValidFormat = isKeyFormatValid(apiKey.trim());

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
