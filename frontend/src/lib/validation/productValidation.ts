import { z } from 'zod';

export const productUpdateSchema = z.object({
  price: z.number()
    .min(0.01, 'Η τιμή πρέπει να είναι μεγαλύτερη από 0')
    .max(9999.99, 'Η τιμή είναι πολύ υψηλή'),
  
  stock: z.number()
    .int('Το απόθεμα πρέπει να είναι ακέραιος αριθμός')
    .min(0, 'Το απόθεμα δεν μπορεί να είναι αρνητικό')
    .max(99999, 'Το απόθεμα είναι πολύ υψηλό'),
});

export type ProductUpdateData = z.infer<typeof productUpdateSchema>;

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('el-GR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(price);
};

export const validateProductUpdate = (data: unknown): ProductUpdateData => {
  return productUpdateSchema.parse(data);
};