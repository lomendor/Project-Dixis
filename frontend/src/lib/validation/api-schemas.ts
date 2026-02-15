/**
 * Zod schemas for API response validation (Phase 4A — Strategic Fixes)
 *
 * These schemas validate what the Laravel API ACTUALLY returns at runtime.
 * Key difference from checkout.ts schemas: prices are STRINGS here (API format),
 * not numbers (checkout form format).
 *
 * Usage:
 *   import { ProductSchema, safeParseProduct } from '@/lib/validation/api-schemas';
 *   const result = safeParseProduct(apiResponse);
 *   if (!result.success) Sentry.captureMessage('Invalid product response', ...);
 */

import { z } from 'zod';

// ─── Primitives ────────────────────────────────────────────────

/** Price string from API: "7.90", "0.00", "123.45" */
const PriceString = z.string().regex(/^\d+(\.\d{1,2})?$/, 'Μη έγκυρη τιμή');

/** ISO 8601 date string from API */
const DateString = z.string().min(1);

// ─── Category ──────────────────────────────────────────────────

export const CategorySchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  slug: z.string().min(1),
});

// ─── Product Image ─────────────────────────────────────────────

export const ProductImageSchema = z.object({
  id: z.number().int(),
  url: z.string().min(1),
  image_path: z.string().optional(),
  alt_text: z.string().optional(),
  is_primary: z.boolean(),
});

// ─── Producer (nested in Product) ──────────────────────────────

export const ProducerSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  business_name: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
});

// ─── Product ───────────────────────────────────────────────────

export const ProductSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  slug: z.string().optional(),
  price: PriceString,
  current_price: PriceString.optional(),
  unit: z.string().min(1),
  stock: z.number().int().nullable(),
  is_active: z.boolean(),
  description: z.string().nullable(),
  category: z.string().optional(),
  image_url: z.string().nullable().optional(),
  categories: z.array(CategorySchema).default([]),
  images: z.array(ProductImageSchema).default([]),
  producer: ProducerSchema,
});

// ─── Paginated Products Response ───────────────────────────────

export const ProductsPageSchema = z.object({
  current_page: z.number().int(),
  data: z.array(ProductSchema),
  per_page: z.number().int(),
  total: z.number().int(),
  last_page: z.number().int(),
  from: z.number().int().nullable(),
  to: z.number().int().nullable(),
});

// ─── Shipping Address ──────────────────────────────────────────

export const ShippingAddressSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  line1: z.string().optional(),
  line2: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
});

// ─── Order Item ────────────────────────────────────────────────

export const OrderItemSchema = z.object({
  id: z.number().int(),
  product_id: z.number().int(),
  quantity: z.number().int().min(1),
  price: PriceString,
  unit_price: PriceString,
  total_price: PriceString,
  product_name: z.string().min(1),
  product_unit: z.string().min(1),
  product: ProductSchema.optional(),
  producer: z.object({
    id: z.number().int(),
    name: z.string().min(1),
    slug: z.string().optional(),
  }).optional(),
});

// ─── Shipping Line (multi-producer) ────────────────────────────

export const ShippingLineSchema = z.object({
  producer_id: z.number().int(),
  producer_name: z.string().min(1),
  subtotal: PriceString,
  shipping_cost: PriceString,
  shipping_method: z.string().min(1),
  free_shipping_applied: z.boolean(),
});

// ─── Order ─────────────────────────────────────────────────────

export const OrderSchema = z.object({
  id: z.number().int(),
  user_id: z.number().int(),
  public_token: z.string().optional(),
  subtotal: PriceString,
  tax_amount: PriceString,
  shipping_amount: PriceString,
  cod_fee: PriceString.optional(),
  total_amount: PriceString,
  payment_status: z.string().min(1),
  payment_method: z.string().min(1),
  payment_provider: z.string().nullable().optional(),
  payment_reference: z.string().nullable().optional(),
  status: z.string().min(1),
  shipping_method: z.string().min(1),
  shipping_method_label: z.string().optional(),
  shipping_address: z.union([ShippingAddressSchema, z.string()]).optional(),
  shipping_cost: z.number().nullable().optional(),
  shipping_carrier: z.string().nullable().optional(),
  shipping_eta_days: z.number().int().nullable().optional(),
  postal_code: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().nullable().optional(),
  created_at: DateString,
  items: z.array(OrderItemSchema).default([]),
  order_items: z.array(OrderItemSchema).default([]),
  // Multi-producer support
  shipping_total: PriceString.optional(),
  shipping_lines: z.array(ShippingLineSchema).optional(),
  is_multi_producer: z.boolean().optional(),
  type: z.literal('checkout_session').optional(),
  payment_order_id: z.number().int().optional(),
  // Child orders for multi-producer checkout (validated as unknown[] to avoid circular ref)
  orders: z.array(z.record(z.unknown())).optional(),
});

// ─── Shipping Quote ────────────────────────────────────────────

export const ShippingQuoteSchema = z.object({
  carrier: z.string().min(1),
  cost: z.number().min(0),
  etaDays: z.number().int().min(0),
  zone: z.string(),
  details: z.object({
    zip: z.string(),
    city: z.string(),
    weight: z.number(),
    volume: z.number(),
  }).optional(),
});

// ─── Zone Shipping Quote ───────────────────────────────────────

export const ZoneShippingQuoteSchema = z.object({
  price_eur: z.number().min(0),
  zone_name: z.string().nullable(),
  zone_id: z.number().int().optional(),
  method: z.string().min(1),
  free_shipping: z.boolean(),
  free_shipping_reason: z.enum(['threshold', 'pickup']).optional(),
  threshold: z.number().optional(),
  source: z.enum(['zone', 'fallback', 'threshold', 'pickup']),
});

// ─── Cart Shipping Quote ───────────────────────────────────────

export const CartShippingQuoteSchema = z.object({
  producers: z.array(z.object({
    producer_id: z.number().int(),
    producer_name: z.string().min(1),
    subtotal: z.number(),
    shipping_cost: z.number().min(0),
    is_free: z.boolean(),
    free_reason: z.enum(['threshold', 'pickup']).nullable(),
    threshold: z.number().optional(),
    zone: z.string().nullable(),
    weight_grams: z.number(),
  })),
  total_shipping: z.number().min(0),
  cod_fee: z.number().min(0),
  payment_method: z.string(),
  quoted_at: DateString,
  currency: z.string(),
  zone_name: z.string().nullable(),
  method: z.string(),
});

// ─── User / Auth ───────────────────────────────────────────────

export const UserSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['consumer', 'producer', 'admin']),
  address: z.string().optional(),
  created_at: DateString,
  updated_at: DateString,
});

export const AuthResponseSchema = z.object({
  user: UserSchema,
  token: z.string().min(1),
});

// ─── Payment Config ────────────────────────────────────────────

export const PaymentConfigSchema = z.object({
  card_enabled: z.boolean(),
  cod_enabled: z.boolean(),
  stripe_public_key: z.string().optional(),
});

// ─── Safe parse helpers ────────────────────────────────────────

/**
 * Validate API response without throwing. Returns { success, data, error }.
 * Use in production to log validation failures to Sentry without crashing.
 */
export function safeParseProduct(data: unknown) {
  return ProductSchema.safeParse(data);
}

export function safeParseProductsPage(data: unknown) {
  return ProductsPageSchema.safeParse(data);
}

export function safeParseOrder(data: unknown) {
  return OrderSchema.safeParse(data);
}

export function safeParseShippingQuote(data: unknown) {
  return ShippingQuoteSchema.safeParse(data);
}

export function safeParseZoneQuote(data: unknown) {
  return ZoneShippingQuoteSchema.safeParse(data);
}

export function safeParseCartQuote(data: unknown) {
  return CartShippingQuoteSchema.safeParse(data);
}

export function safeParseUser(data: unknown) {
  return UserSchema.safeParse(data);
}

export function safeParseAuth(data: unknown) {
  return AuthResponseSchema.safeParse(data);
}

export function safeParsePaymentConfig(data: unknown) {
  return PaymentConfigSchema.safeParse(data);
}

// ─── Type exports ──────────────────────────────────────────────

export type ValidatedProduct = z.infer<typeof ProductSchema>;
export type ValidatedProductsPage = z.infer<typeof ProductsPageSchema>;
export type ValidatedOrder = z.infer<typeof OrderSchema>;
export type ValidatedShippingQuote = z.infer<typeof ShippingQuoteSchema>;
export type ValidatedZoneQuote = z.infer<typeof ZoneShippingQuoteSchema>;
export type ValidatedCartQuote = z.infer<typeof CartShippingQuoteSchema>;
export type ValidatedUser = z.infer<typeof UserSchema>;
export type ValidatedAuth = z.infer<typeof AuthResponseSchema>;
