import { z } from 'zod';

/**
 * Shipping & Logistics Payload Schemas
 * 
 * Comprehensive validation for shipping quotes, delivery options,
 * and logistics coordination with Greek postal services.
 */

// Greek postal code validation (reused from checkout)
const greekPostalCodeSchema = z
  .string()
  .regex(/^\d{5}$/, 'Postal code must be exactly 5 digits')
  .refine(
    (code) => {
      const num = parseInt(code);
      return num >= 10000 && num <= 99999;
    },
    'Please enter a valid Greek postal code'
  );

/**
 * Shipping Quote Request Schema
 */
export const shippingQuoteRequestSchema = z.object({
  postal_code: greekPostalCodeSchema,
  city: z
    .string()
    .min(2, 'City name is required')
    .max(50, 'City name must be less than 50 characters'),
  weight: z
    .number()
    .positive('Total weight must be positive')
    .max(50, 'Maximum weight is 50kg per order'),
  total_value: z
    .number()
    .positive('Order total must be positive'),
  items_count: z
    .number()
    .int('Items count must be a whole number')
    .min(1, 'At least one item is required')
    .max(50, 'Maximum 50 items per order'),
  priority: z
    .enum(['standard', 'express', 'next_day'])
    .default('standard'),
});

export type ShippingQuoteRequest = z.infer<typeof shippingQuoteRequestSchema>;

/**
 * Shipping Method Schema
 */
export const shippingMethodSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  cost: z.number().nonnegative('Shipping cost cannot be negative'),
  estimated_delivery_days: z
    .number()
    .int('Delivery days must be a whole number')
    .min(1, 'Minimum delivery time is 1 day')
    .max(30, 'Maximum delivery time is 30 days'),
  service_provider: z.enum(['elta', 'courier', 'geniki_taxydromiki', 'acs']),
  tracking_available: z.boolean(),
  insurance_included: z.boolean(),
  weight_limit: z.number().positive().optional(),
  restrictions: z.array(z.string()).optional(),
});

export type ShippingMethod = z.infer<typeof shippingMethodSchema>;

/**
 * Shipping Quote Response Schema
 */
export const shippingQuoteResponseSchema = z.object({
  available_methods: z
    .array(shippingMethodSchema)
    .min(1, 'At least one shipping method must be available'),
  fallback_method: shippingMethodSchema.optional(),
  zone: z.enum(['urban', 'suburban', 'remote', 'island']),
  estimated_pickup_date: z.string().optional(),
  special_requirements: z.array(z.string()).optional(),
  quote_expires_at: z.string(),
});

export type ShippingQuoteResponse = z.infer<typeof shippingQuoteResponseSchema>;

/**
 * Shipping Validation Error Schema
 */
export const shippingErrorSchema = z.object({
  message: z.string(),
  error_code: z.enum([
    'INVALID_POSTAL_CODE',
    'UNSUPPORTED_AREA',
    'WEIGHT_EXCEEDED',
    'VALUE_EXCEEDED',
    'SERVICE_UNAVAILABLE',
    'TEMPORARY_ERROR',
  ]),
  retry_after: z.number().optional(),
  fallback_options: z.array(shippingMethodSchema).optional(),
});

export type ShippingError = z.infer<typeof shippingErrorSchema>;

/**
 * Tracking Information Schema
 */
export const trackingInfoSchema = z.object({
  tracking_number: z.string(),
  carrier: z.enum(['elta', 'courier', 'geniki_taxydromiki', 'acs']),
  status: z.enum([
    'pending',
    'picked_up',
    'in_transit',
    'out_for_delivery',
    'delivered',
    'failed_delivery',
    'returned',
  ]),
  estimated_delivery: z.string().optional(),
  location: z.string().optional(),
  events: z.array(
    z.object({
      timestamp: z.string(),
      status: z.string(),
      location: z.string().optional(),
      description: z.string(),
    })
  ),
  delivery_proof: z
    .object({
      signature: z.string().optional(),
      photo_url: z.string().url().optional(),
      delivered_to: z.string().optional(),
      timestamp: z.string(),
    })
    .optional(),
});

export type TrackingInfo = z.infer<typeof trackingInfoSchema>;

/**
 * Shipping Address Validation Schema
 */
export const shippingAddressSchema = z.object({
  street: z
    .string()
    .min(5, 'Street address must be at least 5 characters')
    .max(200, 'Street address must be less than 200 characters'),
  city: z
    .string()
    .min(2, 'City name must be at least 2 characters')
    .max(50, 'City name must be less than 50 characters')
    .regex(
      /^[a-zA-ZΑ-Ωα-ωάέήίόύώΐΰ\s\-']+$/,
      'City name can only contain letters, spaces, and Greek characters'
    ),
  postal_code: greekPostalCodeSchema,
  region: z.string().optional(),
  floor: z.string().max(20).optional(),
  apartment: z.string().max(20).optional(),
  buzzer_code: z.string().max(20).optional(),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

/**
 * Validation helper functions with user-friendly error messages
 */
export const validateShippingQuoteRequest = (data: unknown): ShippingQuoteRequest => {
  try {
    return shippingQuoteRequestSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const friendlyErrors = error.errors.map((err) => {
        const field = err.path.join('.');
        return `${field}: ${err.message}`;
      });
      throw new Error(`Shipping quote validation failed: ${friendlyErrors.join(', ')}`);
    }
    throw error;
  }
};

export const validateShippingMethod = (data: unknown): ShippingMethod => {
  try {
    return shippingMethodSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid shipping method: ${error.errors[0]?.message || 'Unknown validation error'}`);
    }
    throw error;
  }
};

export const validateShippingQuoteResponse = (data: unknown): ShippingQuoteResponse => {
  try {
    return shippingQuoteResponseSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Invalid shipping quote response from server');
    }
    throw error;
  }
};

export const validateTrackingInfo = (data: unknown): TrackingInfo => {
  try {
    return trackingInfoSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Invalid tracking information from server');
    }
    throw error;
  }
};

/**
 * Business logic validators
 */

/**
 * Validate if a postal code is serviced by a specific carrier
 */
export const isServicedByCarrier = (
  postalCode: string,
  carrier: 'elta' | 'courier' | 'geniki_taxydromiki' | 'acs'
): boolean => {
  try {
    greekPostalCodeSchema.parse(postalCode);
    const code = parseInt(postalCode);
    
    switch (carrier) {
      case 'elta':
        // ELTA serves all areas but may have delays in remote areas
        return true;
      case 'courier':
        // Courier services typically serve urban and suburban areas
        return code >= 10000 && code <= 19999; // Athens area example
      case 'geniki_taxydromiki':
        // Geniki Taxydromiki has wide coverage
        return true;
      case 'acs':
        // ACS has selective coverage
        return code >= 10000 && code <= 99999;
      default:
        return false;
    }
  } catch {
    return false;
  }
};

/**
 * Calculate estimated shipping cost based on weight and distance
 */
export const estimateShippingCost = (
  weight: number,
  postalCode: string,
  priority: 'standard' | 'express' | 'next_day' = 'standard'
): number => {
  try {
    greekPostalCodeSchema.parse(postalCode);
    
    const baseRate = 3.50; // Base rate in EUR
    const weightRate = Math.max(0, weight - 1) * 1.20; // Additional per kg after first kg
    
    // Zone multiplier based on postal code
    const code = parseInt(postalCode);
    let zoneMultiplier = 1.0;
    
    if (code >= 70000 && code <= 74999) {
      // Crete
      zoneMultiplier = 1.5;
    } else if (code >= 80000) {
      // Islands
      zoneMultiplier = 2.0;
    } else if (code >= 10000 && code <= 19999) {
      // Athens area
      zoneMultiplier = 1.0;
    } else if (code >= 54000 && code <= 56999) {
      // Thessaloniki area
      zoneMultiplier = 1.1;
    } else {
      // Other areas
      zoneMultiplier = 1.2;
    }
    
    // Priority multiplier
    const priorityMultiplier = {
      standard: 1.0,
      express: 1.5,
      next_day: 2.0,
    }[priority];
    
    return Math.round((baseRate + weightRate) * zoneMultiplier * priorityMultiplier * 100) / 100;
  } catch {
    return 5.0; // Fallback cost
  }
};