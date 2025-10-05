import { z } from 'zod';

export const CartItem = z.object({
  productId: z.string().min(6),
  qty: z.coerce.number().int().min(1).max(99)
});

export const CheckoutSchema = z.object({
  items: z.array(CartItem).min(1),
  shipping: z.object({
    name: z.string().min(2),
    line1: z.string().min(3),
    city: z.string().min(2),
    postal: z.string().min(3)
  }),
  contactEmail: z.string().email().optional()
});
