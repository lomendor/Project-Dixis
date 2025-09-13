'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useCheckout } from '@/hooks/useCheckout';
import { formatCurrency } from '@/env';
import CartSummary from '@/components/cart/CartSummary';

export default function Cart() {
  const {
    cart,
    isLoading,
    error,
    shippingMethods,
    selectedShippingMethod,
    form,
    formErrors,
    loadCart,
    getShippingQuote,
    selectShippingMethod,
    updateShippingInfo,
    validateForm,
    calculateOrderSummary,
    processCheckout,
    clearErrors
  } = useCheckout();

  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { trackCheckoutStart, trackOrderComplete } = useAnalytics();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    loadCart();
  }, [isAuthenticated, authLoading, router, loadCart]);

  const handleShippingQuote = async () => {
    if (!form.shipping?.postalCode || !form.shipping?.city) {
      showToast('error', 'Συμπληρώστε ΤΚ και πόλη για υπολογισμό μεταφορικών');
      return;
    }
    await getShippingQuote({
      postal_code: form.shipping.postalCode,
      city: form.shipping.city
    });
  };

  const handleCheckout = async () => {
    if (orderSummary && cart) {
      trackCheckoutStart(orderSummary.total_amount, cart.length, user?.id?.toString());
    }
    const order = await processCheckout();
    if (order && orderSummary && cart) {
      trackOrderComplete(order.id.toString(), orderSummary.total_amount, cart.length, 'cod', user?.id?.toString());
      showToast('success', `Παραγγελία ${order.id} ολοκληρώθηκε!`);
      router.push(`/orders/${order.id}`);
    }
  };

  const orderSummary = calculateOrderSummary();

  if (authLoading || isLoading) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <ErrorState message={error} onRetry={loadCart} />
        </div>
      </>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-4 py-8" data-testid="page-root">
          <EmptyState 
            title="Το καλάθι σας είναι κενό"
            description="Προσθέστε προϊόντα για να συνεχίσετε με την αγορά."
            data-testid="empty-cart-message"
          />
          <div className="text-center mt-6">
            <Link href="/products" className="btn btn-primary">
              Συνέχεια στην αγορά
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8" data-testid="page-root">
        <h1 className="text-3xl font-bold mb-6">Καλάθι Αγορών</h1>
        
        {/* Cart Items */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">Παραγωγός: {item.producer_name}</p>
                    <p className="font-medium">{formatCurrency(item.price)} x {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(item.subtotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Sidebar */}
          <div className="space-y-6">
            {/* Shipping Info */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Στοιχεία Αποστολής</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ταχυδρομικός Κώδικας</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md"
                    value={form.shipping?.postalCode || ''}
                    onChange={(e) => updateShippingInfo({ postalCode: e.target.value })}
                    placeholder="12345"
                  />
                  {formErrors['shipping.postalCode'] && (
                    <p className="text-red-500 text-sm mt-1">{formErrors['shipping.postalCode']}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Πόλη</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md"
                    value={form.shipping?.city || ''}
                    onChange={(e) => updateShippingInfo({ city: e.target.value })}
                    placeholder="Αθήνα"
                  />
                  {formErrors['shipping.city'] && (
                    <p className="text-red-500 text-sm mt-1">{formErrors['shipping.city']}</p>
                  )}
                </div>
                <button
                  onClick={handleShippingQuote}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={isLoading}
                >
                  Υπολογισμός Μεταφορικών
                </button>
              </div>
            </div>

            {/* Shipping Methods */}
            {shippingMethods && shippingMethods.length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Μέθοδος Αποστολής</h3>
                <div className="space-y-2">
                  {shippingMethods.map((method) => (
                    <label key={method.id} className="flex items-center">
                      <input
                        type="radio"
                        name="shipping"
                        value={method.id}
                        checked={selectedShippingMethod?.id === method.id}
                        onChange={() => selectShippingMethod(method)}
                        className="mr-2"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-gray-600">{method.description}</div>
                      </div>
                      <div className="font-medium">{formatCurrency(method.price)}</div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Order Summary */}
            {orderSummary && (
              <CartSummary
                orderSummary={{
                  subtotal: orderSummary.subtotal,
                  shipping_cost: orderSummary.shipping_cost,
                  tax_amount: orderSummary.tax_amount,
                  payment_fees: orderSummary.payment_fees || 0,
                  total_amount: orderSummary.total_amount
                }}
                onCheckout={handleCheckout}
                isLoading={isLoading}
                disabled={!orderSummary}
              />
            )}

            {Object.keys(formErrors).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h4 className="text-red-800 font-medium mb-2">Διορθώστε τα παρακάτω σφάλματα:</h4>
                <ul className="text-red-700 text-sm space-y-1">
                  {Object.values(formErrors).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
                <button
                  onClick={clearErrors}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
                >
                  Καθαρισμός σφαλμάτων
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}