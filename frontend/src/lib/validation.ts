import { z } from 'zod';

// Common validation schemas
export const OrderStatusSchema = z.enum([
  'draft',
  'pending',
  'paid',
  'shipped',
  'delivered',
  'cancelled'
]);

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(50).default(10)
});

// API Request Schemas
export const UpdateOrderStatusSchema = z.object({
  status: OrderStatusSchema
});

export const OrderIdParamsSchema = z.object({
  orderId: z.string().regex(/^\d+$/, 'Order ID must be numeric')
});

export const AuthHeaderSchema = z.object({
  authorization: z.string().regex(/^Bearer .+$/, 'Authorization header must be Bearer token')
});

// API Response Schemas
export const OrderItemSchema = z.object({
  id: z.number(),
  product_id: z.number(),
  product_name: z.string(),
  quantity: z.number().positive(),
  unit_price: z.string(),
  total_price: z.string(),
  product_unit: z.string()
});

export const OrderSchema = z.object({
  id: z.number(),
  status: OrderStatusSchema,
  total_amount: z.string(),
  created_at: z.string(),
  items: z.array(OrderItemSchema)
});

export const OrderDetailsSchema = OrderSchema.extend({
  subtotal: z.string(),
  tax_amount: z.string().optional(),
  shipping_amount: z.string().optional(),
  payment_method: z.string(),
  shipping_method: z.string(),
  shipping_address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  notes: z.string().optional(),
  statusTimeline: z.array(z.object({
    status: z.string(),
    timestamp: z.string(),
    description: z.string()
  })).optional()
});

export const OrderListResponseSchema = z.object({
  orders: z.array(OrderSchema),
  pagination: z.object({
    currentPage: z.number(),
    totalPages: z.number(),
    totalOrders: z.number(),
    perPage: z.number()
  }).optional()
});

// Rate limiting schemas
export const RateLimitRequestSchema = z.object({
  ip: z.string().ip(),
  endpoint: z.string(),
  userId: z.string().optional()
});

// Validation helper functions
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Validation failed' };
  }
}

export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (data: unknown) => {
    const result = validateRequest(schema, data);
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  };
}