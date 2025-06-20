/**
 * Environment variable check utility
 * Helps diagnose configuration issues
 */

import { logger } from './logger';

export function checkEnvironmentVariables(): {
  isValid: boolean;
  missing: string[];
  suggestions: string[];
} {
  const required = ['SESSION_SECRET', 'ENCRYPTION_SECRET'];
  const missing: string[] = [];
  const suggestions: string[] = [];

  for (const envVar of required) {
    if (!process.env[envVar]) {
      missing.push(envVar);
      suggestions.push(`Add ${envVar}=your-secret-here to your environment`);
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    suggestions,
  };
}

/**
 * Log environment status (development only)
 */
export function logEnvironmentStatus(): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const check = checkEnvironmentVariables();

  if (check.isValid) {
    logger.success('Environment variables configured correctly', {
      component: 'EnvCheck',
    });
  } else {
    logger.error('Missing environment variables', new Error('Configuration error'), {
      component: 'EnvCheck',
      missing: check.missing,
      suggestions: check.suggestions,
    });
    logger.info('If using Doppler, ensure your secrets are properly loaded', {
      component: 'EnvCheck',
    });
  }
}
