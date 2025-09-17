import { z } from 'zod';

// Shipping Quote Request Schema
export const ShippingQuoteRequestSchema = z.object({
  items: z.array(z.object({
    product_id: z.number(),
    quantity: z.number().min(1)
  })).min(1),
  postal_code: z.string().regex(/^\d{5}$/, 'Postal code must be 5 digits'),
  producer_profile: z.enum(['flat_rate', 'free_shipping', 'premium_producer', 'local_producer']).optional()
});

// Shipping Quote Response Schema
export const ShippingQuoteResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    cost_cents: z.number(),
    cost_eur: z.number(),
    carrier_code: z.string(),
    zone_code: z.string(),
    zone_name: z.string(),
    estimated_delivery_days: z.number(),
    breakdown: z.object({
      base_cost_cents: z.number(),
      weight_adjustment_cents: z.number(),
      volume_adjustment_cents: z.number(),
      zone_multiplier: z.number(),
      actual_weight_kg: z.number(),
      volumetric_weight_kg: z.number(),
      postal_code: z.string(),
      profile_applied: z.string().nullable()
    })
  })
});

// Shipping Label Create Response Schema
export const ShippingLabelCreateResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    tracking_code: z.string(),
    label_url: z.string(),
    carrier_code: z.string(),
    status: z.enum(['pending', 'labeled', 'in_transit', 'delivered', 'failed'])
  })
});

// Order Shipment Response Schema
export const OrderShipmentResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.number(),
    tracking_code: z.string(),
    carrier_code: z.string(),
    status: z.enum(['pending', 'labeled', 'in_transit', 'delivered', 'failed']),
    zone_code: z.string().nullable().optional(),
    shipping_cost_eur: z.number().nullable().optional(),
    shipped_at: z.string().nullable().optional(),
    delivered_at: z.string().nullable().optional(),
    estimated_delivery: z.string().nullable().optional(),
    is_trackable: z.boolean(),
    is_completed: z.boolean()
  })
});

// Error Response Schema (for handling API errors)
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string()
});

// Type exports for TypeScript inference
export type ShippingQuoteRequest = z.infer<typeof ShippingQuoteRequestSchema>;
export type ShippingQuoteResponse = z.infer<typeof ShippingQuoteResponseSchema>;
export type ShippingLabelCreateResponse = z.infer<typeof ShippingLabelCreateResponseSchema>;
export type OrderShipmentResponse = z.infer<typeof OrderShipmentResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// Combined response schemas for union types
export const ShippingQuoteApiResponseSchema = z.union([
  ShippingQuoteResponseSchema,
  ErrorResponseSchema
]);

export const ShippingLabelApiResponseSchema = z.union([
  ShippingLabelCreateResponseSchema,
  ErrorResponseSchema
]);

export const OrderShipmentApiResponseSchema = z.union([
  OrderShipmentResponseSchema,
  ErrorResponseSchema
]);

export type ShippingQuoteApiResponse = z.infer<typeof ShippingQuoteApiResponseSchema>;
export type ShippingLabelApiResponse = z.infer<typeof ShippingLabelApiResponseSchema>;
export type OrderShipmentApiResponse = z.infer<typeof OrderShipmentApiResponseSchema>;