import { z } from 'zod';

/**
 * Authentication Schemas - Core login/registration validation
 */

// Common validation patterns
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must be less than 128 characters');

const roleSchema = z.enum(['consumer', 'producer', 'admin']);

/**
 * Login Request Schema
 */
export const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

/**
 * Registration Request Schema
 */
export const registrationRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: emailSchema,
  password: passwordSchema,
  password_confirmation: z.string(),
  role: roleSchema,
});

export type RegistrationRequest = z.infer<typeof registrationRequestSchema>;

/**
 * Auth Response Schema
 */
export const authResponseSchema = z.object({
  message: z.string(),
  user: z.object({
    id: z.number(),
    name: z.string(),
    email: emailSchema,
    role: roleSchema,
    email_verified_at: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
  token: z.string(),
  token_type: z.literal('Bearer'),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

/**
 * User Profile Schema
 */
export const userProfileSchema = z.object({
  user: z.object({
    id: z.number(),
    name: z.string(),
    email: emailSchema,
    role: roleSchema,
    email_verified_at: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

/**
 * Auth Error Response Schema
 */
export const authErrorSchema = z.object({
  message: z.string(),
  errors: z.record(z.array(z.string())).optional(),
});

export type AuthError = z.infer<typeof authErrorSchema>;

/**
 * Validation helper functions
 */
export const validateLoginRequest = (data: unknown): LoginRequest => {
  try {
    return loginRequestSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const friendlyErrors = error.errors.map((err) => {
        return `${err.path.join('.')}: ${err.message}`;
      });
      throw new Error(`Login validation failed: ${friendlyErrors.join(', ')}`);
    }
    throw error;
  }
};

export const validateRegistrationRequest = (data: unknown): RegistrationRequest => {
  try {
    return registrationRequestSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const friendlyErrors = error.errors.map((err) => {
        return `${err.path.join('.')}: ${err.message}`;
      });
      throw new Error(`Registration validation failed: ${friendlyErrors.join(', ')}`);
    }
    throw error;
  }
};

export const validateAuthResponse = (data: unknown): AuthResponse => {
  try {
    return authResponseSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Invalid authentication response from server');
    }
    throw error;
  }
};

export const validateUserProfile = (data: unknown): UserProfile => {
  try {
    return userProfileSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Invalid user profile response from server');
    }
    throw error;
  }
};