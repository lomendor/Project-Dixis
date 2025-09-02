import { z } from 'zod';

/**
 * Checkout & Order Payload Schemas
 * 
 * Comprehensive validation for checkout flow, orders, and cart items
 * with Greek address validation and shipping requirements.
 */

// Greek postal code validation (5 digits)
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

// Greek city validation
const greekCitySchema = z
  .string()
  .min(2, 'City name must be at least 2 characters')
  .max(50, 'City name must be less than 50 characters')
  .regex(
    /^[a-zA-ZΑ-Ωα-ωάέήίόύώΐΰ\s\-']+$/,
    'City name can only contain letters, spaces, hyphens, and Greek characters'
  );

// Address validation
const addressSchema = z
  .string()
  .min(5, 'Address must be at least 5 characters')
  .max(200, 'Address must be less than 200 characters');

// Phone number validation (Greek format)
const phoneSchema = z
  .string()
  .regex(
    /^(\+30|0030|30)?\s?[26-9]\d{8}$/,
    'Please enter a valid Greek phone number'
  );

/**
 * Shipping Information Schema
 */
export const shippingInfoSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters'),
  address: addressSchema,
  city: greekCitySchema,
  postal_code: greekPostalCodeSchema,
  phone: phoneSchema.optional(),
  delivery_notes: z
    .string()
    .max(500, 'Delivery notes must be less than 500 characters')
    .optional(),
});

export type ShippingInfo = z.infer<typeof shippingInfoSchema>;

/**
 * Cart Item Schema
 */
export const cartItemSchema = z.object({
  id: z.number(),
  product_id: z.number(),
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(999, 'Quantity cannot exceed 999'),
  price: z.number().positive('Price must be positive'),
  product: z.object({
    id: z.number(),
    name: z.string(),
    price: z.number().positive(),
    unit: z.string(),
    stock_quantity: z.number().nonnegative(),
    images: z.array(
      z.object({
        id: z.number().optional(),
        url: z.string().url().optional(),
        image_path: z.string().optional(),
        alt_text: z.string().optional(),
      })
    ),
    producer: z.object({
      id: z.number(),
      name: z.string(),
    }),
  }),
});

export type CartItem = z.infer<typeof cartItemSchema>;

/**
 * Checkout Request Schema
 */
export const checkoutRequestSchema = z.object({
  items: z
    .array(cartItemSchema)
    .min(1, 'At least one item is required for checkout'),
  shipping_info: shippingInfoSchema,
  shipping_cost: z.number().nonnegative('Shipping cost cannot be negative'),
  total_amount: z.number().positive('Total amount must be positive'),
  payment_method: z.enum(['cash_on_delivery', 'bank_transfer'], {
    errorMap: () => ({
      message: 'Payment method must be cash on delivery or bank transfer',
    }),
  }),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

/**
 * Order Response Schema
 */
export const orderResponseSchema = z.object({
  id: z.number(),
  order_number: z.string(),
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  total_amount: z.number().positive(),
  shipping_cost: z.number().nonnegative(),
  payment_method: z.string(),
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded']),
  shipping_info: shippingInfoSchema,
  items: z.array(cartItemSchema),
  created_at: z.string(),
  updated_at: z.string(),
  notes: z.string().optional(),
});

export type OrderResponse = z.infer<typeof orderResponseSchema>;

/**
 * Order Status Update Schema
 */
export const orderStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  tracking_number: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export type OrderStatusUpdate = z.infer<typeof orderStatusUpdateSchema>;

/**
 * Checkout Validation Error Schema
 */
export const checkoutErrorSchema = z.object({
  message: z.string(),
  errors: z.record(z.array(z.string())).optional(),
  field_errors: z
    .object({
      shipping_info: z.record(z.array(z.string())).optional(),
      items: z.array(z.record(z.array(z.string()))).optional(),
    })
    .optional(),
});

export type CheckoutError = z.infer<typeof checkoutErrorSchema>;

/**
 * Validation helper functions
 */
export const validateShippingInfo = (data: unknown): ShippingInfo => {
  try {
    return shippingInfoSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const friendlyErrors = error.errors.map((err) => {
        const field = err.path.join('.');
        return `${field}: ${err.message}`;
      });
      throw new Error(`Shipping information validation failed: ${friendlyErrors.join(', ')}`);
    }
    throw error;
  }
};

export const validateCheckoutRequest = (data: unknown): CheckoutRequest => {
  try {
    return checkoutRequestSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const friendlyErrors = error.errors.map((err) => {
        const field = err.path.join('.');
        return `${field}: ${err.message}`;
      });
      throw new Error(`Checkout validation failed: ${friendlyErrors.join(', ')}`);
    }
    throw error;
  }
};

export const validateCartItem = (data: unknown): CartItem => {
  try {
    return cartItemSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid cart item: ${error.errors[0]?.message || 'Unknown validation error'}`);
    }
    throw error;
  }
};

export const validateOrderResponse = (data: unknown): OrderResponse => {
  try {
    return orderResponseSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Invalid order response from server');
    }
    throw error;
  }
};

/**
 * Business logic validators
 */
export const validatePostalCodeCity = (postalCode: string, city: string): boolean => {
  try {
    greekPostalCodeSchema.parse(postalCode);
    greekCitySchema.parse(city);
    
    // Additional business logic validation
    // Major Greek cities postal code ranges
    const cityPostalRanges: Record<string, [number, number][]> = {
      'ΑΘΗΝΑ': [[10000, 18999], [19000, 19999]],
      'ΘΕΣΣΑΛΟΝΙΚΗ': [[54000, 56999]],
      'ΠΑΤΡΑ': [[26000, 26999]],
      'ΗΡΑΚΛΕΙΟ': [[70000, 71999]],
      'ΛΑΡΙΣΑ': [[41000, 41999]],
      // Add more cities as needed
    };
    
    const normalizedCity = city.toUpperCase().trim();
    const codeNum = parseInt(postalCode);
    
    if (cityPostalRanges[normalizedCity]) {
      return cityPostalRanges[normalizedCity].some(
        ([min, max]) => codeNum >= min && codeNum <= max
      );
    }
    
    // If city not in our specific validation list, accept any valid postal code
    return true;
  } catch {
    return false;
  }
};