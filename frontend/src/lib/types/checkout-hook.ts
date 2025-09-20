/**
 * TypeScript Types for useCheckout Hook
 * Extends existing validation types with React-specific state management
 */

import type { 
  CheckoutForm, 
  CartLine, 
  ShippingMethod, 
  PaymentMethod, 
  OrderSummary 
} from '../validation/checkout';
import type { Order } from '../api';
import type { CheckoutApiError } from '../api/checkout';

// Hook configuration options
export interface UseCheckoutOptions {
  autoLoadCart?: boolean;
  enableOptimisticUpdates?: boolean;
  debounceMs?: number;
}

// Hook-specific error types
export interface CheckoutHookError extends CheckoutApiError {
  context?: 'cart' | 'shipping' | 'validation' | 'checkout';
  timestamp?: string;
}