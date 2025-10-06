import { z } from 'zod';

export const ProductFormSchema = z.object({
  title: z.string().min(2, 'Δώστε τίτλο (≥2 χαρακτήρες)'),
  category: z.string().min(1, 'Επιλέξτε κατηγορία'),
  price: z.coerce.number().min(0, 'Τιμή ≥ 0'),
  unit: z.string().min(1, 'Μονάδα μέτρησης'),
  stock: z.coerce.number().int().min(0, 'Απόθεμα ≥ 0'),
  description: z.string().optional(),
  imageUrl: z.string().url('Μη έγκυρη διεύθυνση εικόνας').optional().or(z.literal('').transform(() => undefined)),
  isActive: z.coerce.boolean().optional().default(true),
  producerId: z.string().min(1, 'Παραγωγός απαιτείται'),
});

export type ProductForm = z.infer<typeof ProductFormSchema>;
