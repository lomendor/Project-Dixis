import { z } from 'zod';

// Core event types for Greek marketplace analytics
export const analyticsEventSchema = z.discriminatedUnion('event_type', [
  // Page view events
  z.object({
    event_type: z.literal('page_view'),
    page_path: z.string(),
    page_title: z.string().optional(),
    user_id: z.string().optional(),
    session_id: z.string(),
    timestamp: z.string(),
  }),

  // Product events
  z.object({
    event_type: z.literal('add_to_cart'),
    product_id: z.number(),
    product_name: z.string(),
    price: z.number(),
    quantity: z.number(),
    user_id: z.string().optional(),
    session_id: z.string(),
    timestamp: z.string(),
  }),

  // Checkout events
  z.object({
    event_type: z.literal('checkout_start'),
    cart_value: z.number(),
    item_count: z.number(),
    user_id: z.string().optional(),
    session_id: z.string(),
    timestamp: z.string(),
  }),

  // Order events
  z.object({
    event_type: z.literal('order_complete'),
    order_id: z.string(),
    total_amount: z.number(),
    item_count: z.number(),
    payment_method: z.string(),
    user_id: z.string().optional(),
    session_id: z.string(),
    timestamp: z.string(),
  }),
]);

export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>;

export const validateEvent = (event: unknown): AnalyticsEvent => {
  return analyticsEventSchema.parse(event);
};

// Event factory functions
export const createPageViewEvent = (
  page_path: string,
  session_id: string,
  page_title?: string,
  user_id?: string
): AnalyticsEvent => ({
  event_type: 'page_view',
  page_path,
  page_title,
  user_id,
  session_id,
  timestamp: new Date().toISOString(),
});

export const createAddToCartEvent = (
  product_id: number,
  product_name: string,
  price: number,
  quantity: number,
  session_id: string,
  user_id?: string
): AnalyticsEvent => ({
  event_type: 'add_to_cart',
  product_id,
  product_name,
  price,
  quantity,
  user_id,
  session_id,
  timestamp: new Date().toISOString(),
});

export const createCheckoutStartEvent = (
  cart_value: number,
  item_count: number,
  session_id: string,
  user_id?: string
): AnalyticsEvent => ({
  event_type: 'checkout_start',
  cart_value,
  item_count,
  user_id,
  session_id,
  timestamp: new Date().toISOString(),
});

export const createOrderCompleteEvent = (
  order_id: string,
  total_amount: number,
  item_count: number,
  payment_method: string,
  session_id: string,
  user_id?: string
): AnalyticsEvent => ({
  event_type: 'order_complete',
  order_id,
  total_amount,
  item_count,
  payment_method,
  user_id,
  session_id,
  timestamp: new Date().toISOString(),
});