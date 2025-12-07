import { z } from 'zod';

/**
 * Validation schemas για authentication forms με ελληνικά μηνύματα σφαλμάτων
 */

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Παρακαλώ συμπληρώστε το email σας')
    .email('Το email δεν είναι σε σωστή μορφή'),
  password: z
    .string()
    .min(1, 'Παρακαλώ συμπληρώστε τον κωδικό σας')
    .min(8, 'Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες'),
});

// Base schema for field-level validation (without refine)
const registerBaseSchema = z.object({
  name: z
    .string()
    .min(1, 'Παρακαλώ συμπληρώστε το όνομά σας')
    .min(2, 'Το όνομα πρέπει να έχει τουλάχιστον 2 χαρακτήρες'),
  email: z
    .string()
    .min(1, 'Παρακαλώ συμπληρώστε το email σας')
    .email('Το email δεν είναι σε σωστή μορφή'),
  password: z
    .string()
    .min(1, 'Παρακαλώ συμπληρώστε τον κωδικό σας')
    .min(8, 'Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες'),
  password_confirmation: z
    .string()
    .min(1, 'Παρακαλώ επιβεβαιώστε τον κωδικό σας'),
  role: z.enum(['consumer', 'producer', 'admin']),
});

// Full schema with password matching validation
export const registerSchema = registerBaseSchema.refine(
  (data) => data.password === data.password_confirmation,
  {
    message: 'Οι κωδικοί δεν ταιριάζουν',
    path: ['password_confirmation'],
  }
);

// Export base schema for field-level validation
export const registerFieldSchema = registerBaseSchema;

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
