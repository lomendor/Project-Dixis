/**
 * Cart Page - Simplified Container with Component Integration
 * PR-88c-3A: Cart Container + Wire-up
 * 
 * Uses CartItem and CartSummary components with useCart hook
 * MSW mocks provide deterministic data for testing
 */

'use client';

import { useCart } from '@/hooks/useCart';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import type { OrderSummary, ShippingMethod, PaymentMethod } from '@/lib/validation/checkout';

// Mock shipping and payment methods for wire-up
const mockShippingMethods: ShippingMethod[] = [
  { id: 'courier', name: 'Courier Delivery', price: 5.50, estimated_days: 2 },
  { id: 'pickup', name: 'Store Pickup', price: 0, estimated_days: 1 },
];

const mockPaymentMethod: PaymentMethod = {
  id: 'cod',
  type: 'cash_on_delivery',
  name: 'Cash on Delivery',
  fixed_fee: 0,
};

export default function CartPage() {
  const {
    items,
    subtotal,
    shippingCost,
    taxAmount,
    totalAmount,
    isLoading,
    error,
    updateQuantity,
    removeItem,
    clearError,
  } = useCart();

  // Create order summary for CartSummary component
  const orderSummary: OrderSummary | null = items.length > 0 ? {
    items: items.map(item => ({
      id: item.id,
      product_id: item.product_id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.subtotal,
      producer_name: item.producer_name,
    })),
    subtotal,
    shipping_method: mockShippingMethods[0],
    shipping_cost: shippingCost,
    payment_method: mockPaymentMethod,
    payment_fees: 0,
    tax_amount: taxAmount,
    total_amount: totalAmount,
  } : null;

  const handleCheckout = async () => {
    console.log('Checkout initiated with:', orderSummary);
    // TODO: Implement checkout flow in PR-88c-3B
  };

  const handleSelectShipping = (method: ShippingMethod) => {
    console.log('Shipping method selected:', method);
    // TODO: Implement shipping selection in PR-88c-3B
  };

  const handleSelectPayment = (method: PaymentMethod) => {
    console.log('Payment method selected:', method);
    // TODO: Implement payment selection in PR-88c-3B
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="page-root">
      <main className="max-w-6xl mx-auto px-4 py-8" data-testid="cart-page">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Το Καλάθι Σας
          </h1>
          <p className="text-gray-600">
            Ελέγξτε τα προϊόντα σας και προχωρήστε στην παραγγελία
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
                <button
                  onClick={clearError}
                  className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                >
                  Αγνόηση
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">Φόρτωση καλαθιού...</span>
          </div>
        )}

        {/* Empty Cart */}
        {!isLoading && items.length === 0 && (
          <div className="text-center py-12" data-testid="empty-cart">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293A1 1 0 005 16v0a1 1 0 001 1h11M9 19a2 2 0 100 4 2 2 0 000-4zM20 19a2 2 0 100 4 2 2 0 000-4z"
              />
            </svg>
            <h3 className="mt-6 text-lg font-medium text-gray-900">Το καλάθι είναι κενό</h3>
            <p className="mt-2 text-gray-500">
              Προσθέστε προϊόντα για να ξεκινήσετε τις αγορές σας
            </p>
            <div className="mt-6">
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                Περιήγηση Προϊόντων
              </a>
            </div>
          </div>
        )}

        {/* Cart Content */}
        {!isLoading && items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Προϊόντα ({items.length})
              </h2>
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onQuantityChange={(id: number, quantity: number) => updateQuantity(id, quantity).then(() => {})}
                  onRemove={(id: number) => removeItem(id).then(() => {})}
                  isUpdating={isLoading}
                />
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              {orderSummary && (
                <CartSummary
                  summary={orderSummary}
                  shippingMethods={mockShippingMethods}
                  selectedShippingMethod={mockShippingMethods[0]}
                  selectedPaymentMethod={mockPaymentMethod}
                  onCheckout={handleCheckout}
                  onSelectShippingMethod={handleSelectShipping}
                  onSelectPaymentMethod={handleSelectPayment}
                  isProcessing={false}
                  isLoadingShipping={false}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}