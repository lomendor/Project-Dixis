import { z } from 'zod';

/**
 * Environment Configuration Schema
 * 
 * Validates all environment variables at runtime to ensure:
 * 1. Required variables are present
 * 2. URLs are properly formatted
 * 3. Locale values are valid
 * 4. Type safety throughout the application
 */

const envSchema = z.object({
  // API Configuration
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .url('API_BASE_URL must be a valid URL')
    .default('http://127.0.0.1:8001/api/v1')
    .describe('Backend API base URL'),

  // Application URLs
  NEXT_PUBLIC_BASE_URL: z
    .string()
    .url('BASE_URL must be a valid URL')
    .default('http://127.0.0.1:3001')
    .describe('Frontend application base URL'),

  // Internationalization
  NEXT_PUBLIC_LOCALE: z
    .enum(['en', 'el', 'en-US', 'el-GR'])
    .default('en')
    .describe('Application locale for i18n'),

  // Optional Analytics & Tracking
  NEXT_PUBLIC_ANALYTICS_ID: z
    .string()
    .optional()
    .describe('Analytics tracking ID (Google Analytics, etc.)'),

  // Development & Testing
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development')
    .describe('Node.js environment'),

  // E2E Testing Configuration
  PLAYWRIGHT_BASE_URL: z
    .string()
    .url()
    .optional()
    .describe('Base URL for Playwright E2E tests'),

  PLAYWRIGHT_SKIP_WEBSERVER: z
    .string()
    .transform((val) => val === 'true')
    .optional()
    .describe('Skip webserver startup in Playwright'),
});

/**
 * Validated Environment Configuration
 * 
 * This performs runtime validation of all environment variables
 * and provides type-safe access throughout the application.
 */
export const env = (() => {
  // Collect environment variables
  const rawEnv = {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_LOCALE: process.env.NEXT_PUBLIC_LOCALE,
    NEXT_PUBLIC_ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,
    NODE_ENV: process.env.NODE_ENV,
    PLAYWRIGHT_BASE_URL: process.env.PLAYWRIGHT_BASE_URL,
    PLAYWRIGHT_SKIP_WEBSERVER: process.env.PLAYWRIGHT_SKIP_WEBSERVER,
  };

  try {
    // Validate and return parsed environment
    return envSchema.parse(rawEnv);
  } catch (error) {
    // Provide clear error messages for environment issues
    console.error('❌ Environment validation failed:');
    
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        console.error(`  • ${path}: ${err.message}`);
      });
      
      // Show example .env.local for missing required variables
      console.error('\n💡 Create a .env.local file with:');
      console.error('NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8001/api/v1');
      console.error('NEXT_PUBLIC_BASE_URL=http://127.0.0.1:3001');
      console.error('NEXT_PUBLIC_LOCALE=en');
    }
    
    throw new Error(`Environment validation failed. Please check your environment variables.`);
  }
})();

/**
 * Type-safe environment configuration
 * 
 * Usage:
 * ```typescript
 * import { env } from '@lib/env';
 * 
 * const apiUrl = env.NEXT_PUBLIC_API_BASE_URL; // Guaranteed to be a valid URL
 * const locale = env.NEXT_PUBLIC_LOCALE; // Guaranteed to be 'en' | 'el' | 'en-US' | 'el-GR'
 * ```
 */
export type Environment = z.infer<typeof envSchema>;

/**
 * Utility functions for environment-specific behavior
 */
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';

/**
 * Localization helpers
 */
export const isGreek = env.NEXT_PUBLIC_LOCALE.startsWith('el');
export const isEnglish = env.NEXT_PUBLIC_LOCALE.startsWith('en');

/**
 * API URL builders with validation
 */
export const apiUrl = (path: string = '') => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${env.NEXT_PUBLIC_API_BASE_URL}/${cleanPath}`;
};

export const appUrl = (path: string = '') => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${env.NEXT_PUBLIC_BASE_URL}/${cleanPath}`;
};