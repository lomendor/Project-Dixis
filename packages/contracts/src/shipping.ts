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