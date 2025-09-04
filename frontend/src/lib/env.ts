import { z } from 'zod';

/**
 * Environment Configuration Schema
 * 
 * Core runtime validation for essential environment variables.
 */

const envSchema = z.object({
  // API Configuration
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .url('API_BASE_URL must be a valid URL')
    .default('http://127.0.0.1:8001/api/v1'),

  // Application URLs
  NEXT_PUBLIC_BASE_URL: z
    .string()
    .url('BASE_URL must be a valid URL')
    .default('http://127.0.0.1:3001'),

  // Internationalization
  NEXT_PUBLIC_LOCALE: z
    .enum(['en', 'el', 'en-US', 'el-GR'])
    .default('en'),

  // Development Environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

/**
 * Validated Environment Configuration
 */
export const env = (() => {
  const rawEnv = {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_LOCALE: process.env.NEXT_PUBLIC_LOCALE,
    NODE_ENV: process.env.NODE_ENV,
  };

  try {
    return envSchema.parse(rawEnv);
  } catch (error) {
    console.error('❌ Environment validation failed:');
    
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  • ${err.path.join('.')}: ${err.message}`);
      });
    }
    
    throw new Error('Environment validation failed. Please check your environment variables.');
  }
})();

export type Environment = z.infer<typeof envSchema>;
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';