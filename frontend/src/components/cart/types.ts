/**
 * Cart Component Types - Foundation Interfaces
 * PR-88c-3: Cart UI Wire-up with useCheckout Hook
 */

import type { CartLine, ShippingMethod, PaymentMethod, OrderSummary } from '@/lib/validation/checkout';

// CartItem Component Interface
export interface CartItemProps {
  item: CartLine;
  onQuantityChange: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
  isUpdating?: boolean;
}

// CartSummary Component Interface  
export interface CartSummaryProps {
  summary: OrderSummary | null;
  shippingMethods: ShippingMethod[] | null;
  selectedShippingMethod: ShippingMethod | null;
  selectedPaymentMethod: PaymentMethod | null;
  onCheckout: () => Promise<void>;
  onSelectShippingMethod: (method: ShippingMethod) => void;
  onSelectPaymentMethod: (method: PaymentMethod) => void;
  isProcessing: boolean;
  isLoadingShipping: boolean;
}

// CartPageClient Component Interface
export interface CartPageClientProps {
  // No external props needed - internal state management with hook
}

// Shared component states
export interface CartComponentState {
  isLoading: boolean;
  error: string | null;
}