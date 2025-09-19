import { z } from 'zod'

// Shipping Provider Configuration
export const ShippingProviderSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.enum(['COURIER', 'ACS', 'GENIKI', 'SPEEDEX']),
  isActive: z.boolean(),
  baseRate: z.number().positive(),
  freeShippingThreshold: z.number().positive().optional(),
})

export type ShippingProvider = z.infer<typeof ShippingProviderSchema>

// Shipping Address
export const ShippingAddressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().regex(/^\d{5}$/, 'Invalid Greek postal code'),
  region: z.string().min(1),
  country: z.literal('GR'),
  phone: z.string().optional(),
})

export type ShippingAddress = z.infer<typeof ShippingAddressSchema>

// Shipping Cost Calculation
export const ShippingCostRequestSchema = z.object({
  providerId: z.string(),
  weight: z.number().positive(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
  }).optional(),
  destination: ShippingAddressSchema,
  orderValue: z.number().positive(),
})

export const ShippingCostResponseSchema = z.object({
  providerId: z.string(),
  cost: z.number().nonnegative(),
  estimatedDays: z.number().int().positive(),
  isFreeShipping: z.boolean(),
  trackingAvailable: z.boolean(),
})

export type ShippingCostRequest = z.infer<typeof ShippingCostRequestSchema>
export type ShippingCostResponse = z.infer<typeof ShippingCostResponseSchema>

// Tracking Information
export const TrackingStatusSchema = z.enum([
  'PENDING',
  'PICKED_UP',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'FAILED_DELIVERY',
  'RETURNED'
])

export const TrackingEventSchema = z.object({
  status: TrackingStatusSchema,
  timestamp: z.string().datetime(),
  location: z.string().optional(),
  description: z.string(),
})

export const TrackingResponseSchema = z.object({
  trackingNumber: z.string(),
  providerId: z.string(),
  currentStatus: TrackingStatusSchema,
  estimatedDelivery: z.string().datetime().optional(),
  events: z.array(TrackingEventSchema),
  lastUpdated: z.string().datetime(),
})

export type TrackingStatus = z.infer<typeof TrackingStatusSchema>
export type TrackingEvent = z.infer<typeof TrackingEventSchema>
export type TrackingResponse = z.infer<typeof TrackingResponseSchema>

// Delivery Method Enum
export const DeliveryMethodSchema = z.enum(['HOME', 'LOCKER'])
export type DeliveryMethod = z.infer<typeof DeliveryMethodSchema>

// Payment Method Enum
export const PaymentMethodSchema = z.enum(['CARD', 'COD'])
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>

// Locker Information
export const LockerSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  provider: z.string(),
  lat: z.number(),
  lng: z.number(),
  postal_code: z.string().regex(/^\d{5}$/),
  distance: z.number().optional(),
  operating_hours: z.string().optional(),
  notes: z.string().optional(),
})

export type Locker = z.infer<typeof LockerSchema>

// Shipping Quote Schemas (for the new API)
export const ShippingQuoteRequestSchema = z.object({
  items: z.array(z.object({
    product_id: z.number(),
    quantity: z.number().positive()
  })).min(1),
  postal_code: z.string().regex(/^\d{5}$/),
  delivery_method: DeliveryMethodSchema.optional().default('HOME'),
  payment_method: PaymentMethodSchema.optional().default('CARD'),
})

export const ShippingQuoteResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    cost_cents: z.number(),
    cost_eur: z.number(),
    carrier_code: z.string(),
    zone_code: z.string(),
    zone_name: z.string(),
    estimated_delivery_days: z.number(),
    delivery_method: DeliveryMethodSchema,
    payment_method: PaymentMethodSchema,
    breakdown: z.object({
      base_cost_cents: z.number(),
      weight_adjustment_cents: z.number(),
      volume_adjustment_cents: z.number(),
      zone_multiplier: z.number(),
      actual_weight_kg: z.number(),
      volumetric_weight_kg: z.number(),
      postal_code: z.string(),
      profile_applied: z.string().nullable(),
      locker_discount_cents: z.number().optional(),
      cod_fee_cents: z.number().optional(),
      payment_method: PaymentMethodSchema,
    })
  })
})

export type ShippingQuoteRequest = z.infer<typeof ShippingQuoteRequestSchema>
export type ShippingQuoteResponse = z.infer<typeof ShippingQuoteResponseSchema>

// Locker Search Response
export const LockerSearchResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(LockerSchema),
})

export type LockerSearchResponse = z.infer<typeof LockerSearchResponseSchema>