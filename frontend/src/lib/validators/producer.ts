export { z } from 'zod';
import { z } from 'zod';

export const ProducerCreate = z.object({
  slug: z.string().min(2),
  name: z.string().min(2),
  region: z.string().min(2),
  category: z.string().min(2),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  products: z.coerce.number().int().min(0).default(0),
  rating: z.coerce.number().min(0).max(5).optional(),
  isActive: z.boolean().optional()
});

export const ProducerUpdate = ProducerCreate.partial();

export const QueryParams = z.object({
  q: z.string().optional(),
  region: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12)
});
