/**
 * Schema Validation Index
 * 
 * Central export point for all Zod validation schemas and utilities.
 * Provides type-safe runtime validation for all application payloads.
 */

// Environment validation
export * from './auth';
export * from './checkout';
export * from './shipping';

// Re-export commonly used Zod utilities
import { z } from 'zod';
export { z };

/**
 * Common validation utilities
 */
export const createApiResponseSchema = <T>(dataSchema: z.ZodType<T>) =>
  z.object({
    data: dataSchema,
    message: z.string().optional(),
    status: z.number().optional(),
  });

export const createPaginatedResponseSchema = <T>(itemSchema: z.ZodType<T>) =>
  z.object({
    data: z.array(itemSchema),
    meta: z.object({
      current_page: z.number(),
      last_page: z.number(),
      per_page: z.number(),
      total: z.number(),
      from: z.number().nullable(),
      to: z.number().nullable(),
    }),
    links: z.object({
      first: z.string().url().nullable(),
      last: z.string().url().nullable(),
      prev: z.string().url().nullable(),
      next: z.string().url().nullable(),
    }),
  });

/**
 * Error handling schemas
 */
export const apiErrorSchema = z.object({
  message: z.string(),
  error: z.string().optional(),
  errors: z.record(z.array(z.string())).optional(),
  status_code: z.number().optional(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

/**
 * Generic validation function with user-friendly error messages
 */
export const validatePayload = <T>(
  schema: z.ZodType<T>,
  data: unknown,
  context: string = 'payload'
): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const friendlyErrors = error.errors.map((err) => {
        const field = err.path.length > 0 ? err.path.join('.') : 'root';
        return `${field}: ${err.message}`;
      });
      throw new Error(`${context} validation failed: ${friendlyErrors.join(', ')}`);
    }
    throw error;
  }
};

/**
 * Safe parsing function that returns validation result without throwing
 */
export const safeParsePayload = <T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const friendlyErrors = error.errors.map((err) => {
        const field = err.path.length > 0 ? err.path.join('.') : 'root';
        return `${field}: ${err.message}`;
      });
      return { success: false, error: friendlyErrors.join(', ') };
    }
    return { success: false, error: 'Unknown validation error' };
  }
};