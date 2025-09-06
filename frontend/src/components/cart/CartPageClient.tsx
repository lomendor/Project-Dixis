/**
 * CartPageClient Component - Main Cart Coordinator
 * PR-88c-3: Cart UI Wire-up with useCheckout Hook
 * 
 * Replaces direct API calls in cart page with useCheckout hook
 * Coordinates between CartItem and CartSummary components
 * ~120 LOC target with full implementation
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCheckout } from '@/hooks/useCheckout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import Navigation from '@/components/Navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';
import type { CartPageClientProps } from './types';

export function CartPageClient({}: CartPageClientProps) {
  const checkout = useCheckout();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect during auth loading to prevent race conditions
    if (authLoading) {
      return;
    }
    
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    // Load cart using hook
    checkout.loadCart();
  }, [isAuthenticated, authLoading, router, checkout.loadCart]);

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      // TODO: Wire to checkout.removeItem() or similar method
      showToast('info', 'Removing item...');
      return;
    }

    // TODO: Wire to checkout.updateItem() or similar method
    showToast('info', `Updating quantity to ${newQuantity}...`);
  };

  const handleRemoveItem = async (itemId: number) => {
    // TODO: Wire to checkout.removeItem() method
    showToast('info', 'Removing item from cart...');
  };

  const handleCheckout = async () => {
    try {
      const order = await checkout.processCheckout();
      if (order) {
        showToast('success', `Η παραγγελία δημιουργήθηκε! Κωδικός: ${order.id}`);
        router.push(`/orders/${order.id}`);
      }
    } catch (error) {
      showToast('error', 'Η ολοκλήρωση της παραγγελίας απέτυχε');
    }
  };

  // Show nothing during auth loading or redirect
  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Το Καλάθι Σας
          </h1>
        </div>

        {checkout.isLoading ? (
          <LoadingSpinner text="Loading your cart..." />
        ) : checkout.error ? (
          <ErrorState
            title="Unable to load cart"
            message={checkout.error}
            onRetry={checkout.loadCart}
          />
        ) : !checkout.cart || checkout.cart.length === 0 ? (
          <EmptyState
            icon={
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293A1 1 0 005 16v0a1 1 0 001 1h11M9 19a2 2 0 100 4 2 2 0 000-4zM20 19a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            }
            title="Your cart is empty"
            description="Start shopping to add items to your cart and support local producers."
            actionLabel="Browse Products"
            actionHref="/"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Cart Items ({checkout.cart.length})
                  </h2>
                  
                  <div className="space-y-4">
                    {checkout.cart.map((item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        onQuantityChange={handleQuantityChange}
                        onRemove={handleRemoveItem}
                        isUpdating={false} // TODO: Track updating state per item
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <CartSummary
                summary={checkout.calculateOrderSummary()}
                shippingMethods={checkout.shippingMethods}
                selectedShippingMethod={checkout.selectedShippingMethod}
                selectedPaymentMethod={checkout.selectedPaymentMethod}
                onCheckout={handleCheckout}
                onSelectShippingMethod={checkout.selectShippingMethod}
                onSelectPaymentMethod={checkout.selectPaymentMethod}
                isProcessing={checkout.isLoading}
                isLoadingShipping={false} // TODO: Add shipping loading state
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}