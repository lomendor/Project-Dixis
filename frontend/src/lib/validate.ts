import { z } from 'zod';

export const grPhone = z
  .string()
  .transform((s) => s.trim())
  .refine(
    (v) => /^(\+30\s?)?(\d\s?){10}$/.test(v.replace(/\s+/g, '')),
    { message: 'errors.phone' }
  );

export const grPostal = z
  .string()
  .transform((s) => s.trim())
  .refine((v) => /^\d{5}$/.test(v), { message: 'errors.postal' });

export const shippingSchema = z.object({
  name: z.string().min(2, { message: 'errors.name' }),
  line1: z.string().min(3, { message: 'errors.address' }),
  city: z.string().min(2, { message: 'errors.city' }),
  postal: grPostal,
  phone: grPhone
});
