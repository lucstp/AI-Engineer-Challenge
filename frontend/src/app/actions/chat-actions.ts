'use server';

import { z } from 'zod';

// Form validation schema
const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(4000, 'Message too long'),
  model: z.string().min(1, 'Model is required'),
  apiKey: z.string().min(20, 'Valid API key is required'),
  developerMessage: z.string().optional().default('You are a helpful AI assistant.'),
});

export type ChatFormData = z.infer<typeof chatMessageSchema>;

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export interface FormState {
  message: string;
  errors?: Record<string, string[]>;
  success?: boolean;
}

/**
 * Send a chat message to the FastAPI backend
 * Using modern Next.js 15 Server Action patterns
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

    // Get API URL from environment variables
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    // Make request to FastAPI backend
    const response = await fetch(`${apiUrl}/api/chat`, {
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
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // For now, just return success - streaming will be handled separately
    return {
      message: 'Message sent successfully',
      success: true,
    };
  } catch (error) {
    console.error('Chat action error:', error);

    return {
      message: error instanceof Error ? error.message : 'Unknown error occurred',
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
    // Basic format validation (OpenAI keys start with 'sk-' and are ~51 chars)
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
