import { z } from 'zod';

/**
 * Server-side Environment Configuration
 * 
 * Server-only environment variables for build-time and API configuration.
 */

const serverEnvSchema = z.object({
  // Database Configuration (for build-time validation)
  DATABASE_URL: z
    .string()
    .url('Database URL must be valid')
    .optional(),

  // API Configuration
  API_BASE_URL: z
    .string()
    .url('Internal API URL must be valid')
    .default('http://127.0.0.1:8001/api/v1'),

  // Build Configuration
  BUILD_ANALYZE: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
});

/**
 * Server Environment (only available server-side)
 */
export const serverEnv = (() => {
  // Only validate on server-side
  if (typeof window !== 'undefined') {
    throw new Error('Server environment should not be accessed on client-side');
  }

  const rawServerEnv = {
    DATABASE_URL: process.env.DATABASE_URL,
    API_BASE_URL: process.env.API_BASE_URL,
    BUILD_ANALYZE: process.env.BUILD_ANALYZE,
  };

  return serverEnvSchema.parse(rawServerEnv);
})();

export type ServerEnvironment = z.infer<typeof serverEnvSchema>;