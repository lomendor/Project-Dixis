/**
 * Validation Library Exports
 * Centralized exports for all validation schemas and utilities
 */

// Product validation
export {
  productUpdateSchema,
  validateProductUpdate,
  formatPrice,
  type ProductUpdateData,
} from './productValidation';

// Comprehensive checkout validation schemas
export {
  // Schemas
  CartLineSchema,
  ShippingMethodSchema,
  PaymentMethodSchema,
  OrderSummarySchema,
  CheckoutFormSchema,
  
  // Types
  type CartLine,
  type ShippingMethod,
  type PaymentMethod,
  type OrderSummary,
  type CheckoutForm,
  
  // Validation functions
  validateCartLine,
  validateShippingMethod,
  validatePaymentMethod,
  validateOrderSummary,
  validateCheckoutForm,
  
  // Safe validation functions
  safeValidateCartLine,
  safeValidateShippingMethod,
  safeValidatePaymentMethod,
  safeValidateOrderSummary,
  safeValidateCheckoutForm,
  
  // Utility functions
  calculateCartSubtotal,
  calculateOrderTotal,
  formatEuroPrice,
  validateOrderTotals,
} from './checkout';

// Re-export existing checkout validation for compatibility
export {
  GREEK_POSTAL_CODES,
  checkoutValidationSchema,
  validatePostalCodeCity,
  validateCheckoutPayload,
  getErrorMessage,
  type CheckoutFormData,
  type CheckoutValidationError,
  type CheckoutHttpError,
} from '../checkout/checkoutValidation';