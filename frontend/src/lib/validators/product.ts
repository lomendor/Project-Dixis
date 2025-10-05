import { z } from 'zod';

export const ProductCreate = z.object({
  title: z.string().min(2),
  category: z.string().min(2),
  price: z.coerce.number().min(0).optional(),
  unit: z.string().max(12).optional(),
  stock: z.coerce.number().int().min(0).default(0),
  description: z.string().optional(),
  imageUrl: z.string().url().optional()
});

export const ProductUpdate = ProductCreate.partial();

export const ProductQuery = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  producerId: z.string().optional(),
  slug: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12)
});
