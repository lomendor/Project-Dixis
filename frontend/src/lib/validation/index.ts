/**
 * Validation Library Exports
 */

// Core checkout validation
export {
  CartLineSchema,
  ShippingMethodSchema,
  PaymentMethodSchema,
  OrderSummarySchema,
  CheckoutFormSchema,
  type CartLine,
  type ShippingMethod,
  type PaymentMethod,
  type OrderSummary,
  type CheckoutForm,
  validateCartLine,
  validateShippingMethod,
  validatePaymentMethod,
  validateOrderSummary,
  validateCheckoutForm,
  formatEuroPrice,
} from './checkout';

// API response validation (Phase 4A — Strategic Fixes)
export {
  ProductSchema,
  ProductsPageSchema,
  ProducerSchema,
  CategorySchema,
  OrderSchema,
  OrderItemSchema,
  ShippingQuoteSchema,
  ZoneShippingQuoteSchema,
  CartShippingQuoteSchema,
  UserSchema,
  AuthResponseSchema,
  PaymentConfigSchema,
  safeParseProduct,
  safeParseProductsPage,
  safeParseOrder,
  safeParseShippingQuote,
  safeParseZoneQuote,
  safeParseCartQuote,
  safeParseUser,
  safeParseAuth,
  safeParsePaymentConfig,
  type ValidatedProduct,
  type ValidatedProductsPage,
  type ValidatedOrder,
  type ValidatedShippingQuote,
  type ValidatedZoneQuote,
  type ValidatedCartQuote,
  type ValidatedUser,
  type ValidatedAuth,
} from './api-schemas';