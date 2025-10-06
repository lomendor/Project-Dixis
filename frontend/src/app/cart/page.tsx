'use client';

import { useEffect, useState } from 'react';
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
import { PAYMENT_METHODS, calculatePaymentFees } from '@/lib/payment/paymentMethods';
import { DeliveryMethodSelector } from '@/components/shipping';
import type { PaymentMethod } from '@dixis/contracts/shipping';

export default function Cart() {
const {
    cart,
    isLoading,
    error,
    shippingMethods,
    selectedShippingMethod,
    selectedPaymentMethod,
    form,
    formErrors,
    loadCart,
    getShippingQuote: _getShippingQuote,
    selectShippingMethod,
    selectPaymentMethod,
    updateShippingInfo,
    validateForm: _validateForm,
    calculateOrderSummary,
    processCheckout,
    clearErrors
  } = useCheckout();

  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { trackCheckoutStart, trackOrderComplete } = useAnalytics();
  const router = useRouter();

  const [oversellError, setOversellError] = useState<string | null>(null);
  const [isCheckoutBusy, setIsCheckoutBusy] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    loadCart();
  }, [isAuthenticated, authLoading, router, loadCart]);

  // Auto-select default payment method if none selected
  useEffect(() => {
    if (!selectedPaymentMethod && PAYMENT_METHODS.length > 0) {
      selectPaymentMethod(PAYMENT_METHODS[0]);
    }
  }, [selectedPaymentMethod, selectPaymentMethod]);


const handleCheckout = async () => {
    if (!selectedPaymentMethod) {
      showToast('error', 'Επιλέξτε μέθοδο πληρωμής');
      return;
    }

    setIsCheckoutBusy(true);
    setOversellError(null);

    if (orderSummary && cart) {
      const totalWithPaymentFees = orderSummary.subtotal + orderSummary.shipping_cost + orderSummary.tax_amount + calculatePaymentFees(selectedPaymentMethod, orderSummary.subtotal);
      trackCheckoutStart(totalWithPaymentFees, cart.length, user?.id?.toString());
    }

    // For cash on delivery, proceed with the existing flow
    if (selectedPaymentMethod.type === 'cash_on_delivery') {
      try {
        const order = await processCheckout();
        if (order && orderSummary && cart) {
          trackOrderComplete(order.id.toString(), orderSummary.total_amount, cart.length, 'cod', user?.id?.toString());
          showToast('success', `Παραγγελία ${order.id} ολοκληρώθηκε!`);
          router.push(`/orders/${order.id}`);
        }
      } catch (err: any) {
        // Check for 409 oversell error
        if (err?.status === 409 || err?.message?.includes('Ανεπαρκές απόθεμα')) {
          setOversellError('Κάποια προϊόντα εξαντλήθηκαν. Ενημερώσαμε τις διαθέσιμες ποσότητες.');
          // Reload cart to get current stock levels
          await loadCart();
        } else {
          showToast('error', 'Σφάλμα ολοκλήρωσης παραγγελίας');
        }
      } finally {
        setIsCheckoutBusy(false);
      }
      return;
    }

    // For card payments, redirect to payment page
    if (selectedPaymentMethod.type === 'card') {
      try {
        // Create order first, then redirect to payment page
        const order = await processCheckout();
        if (order) {
          router.push(`/checkout/payment/${order.id}`);
        }
      } catch (err: any) {
        // Check for 409 oversell error
        if (err?.status === 409 || err?.message?.includes('Ανεπαρκές απόθεμα')) {
          setOversellError('Κάποια προϊόντα εξαντλήθηκαν. Ενημερώσαμε τις διαθέσιμες ποσότητες.');
          // Reload cart to get current stock levels
          await loadCart();
        } else {
          showToast('error', 'Σφάλμα ολοκλήρωσης παραγγελίας');
        }
      } finally {
        setIsCheckoutBusy(false);
      }
      return;
    }

    setIsCheckoutBusy(false);
    showToast('error', 'Μέθοδος πληρωμής δεν υποστηρίζεται');
  };

  const orderSummary = calculateOrderSummary();

  // Map frontend payment method type to shipping contract PaymentMethod enum
  const getShippingPaymentMethod = (paymentMethod: typeof selectedPaymentMethod): PaymentMethod => {
    if (!paymentMethod) return 'CARD';
    switch (paymentMethod.type) {
      case 'cash_on_delivery':
        return 'COD';
      case 'card':
        return 'CARD';
      default:
        return 'CARD';
    }
  };

  if (authLoading || isLoading) {
    return (
      <>
        <Navigation />
        <main id="main-content" data-testid="main-content" className="container mx-auto px-4 py-8">
          <LoadingSpinner />
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <main id="main-content" data-testid="main-content" className="container mx-auto px-4 py-8">
          <ErrorState message={error} onRetry={loadCart} />
        </main>
      </>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <>
        <Navigation />
        <main id="main-content" data-testid="main-content" className="container mx-auto px-4 py-8">
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
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main id="main-content" data-testid="main-content" className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6" data-testid="page-title">Καλάθι Αγορών</h1>

        {/* Oversell Error Banner */}
        {oversellError && (
          <div
            className="mb-6 p-4 border border-red-300 rounded-lg bg-red-50 text-red-800"
            data-testid="oversell-error-banner"
          >
            <div className="flex items-start">
              <svg className="w-5 h-5 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="font-medium">{oversellError}</p>
                <button
                  onClick={() => setOversellError(null)}
                  className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
                >
                  Κλείσιμο
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold" data-testid="product-title">{item.name}</h3>
                    <p className="text-sm text-gray-600">Παραγωγός: {item.producer_name}</p>
                    <p className="font-medium" data-testid="cart-item-qty">
                      {formatCurrency(item.price)} x {item.quantity}
                    </p>
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
            {/* Shipping Quote */}
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold mb-4">Στοιχεία Αποστολής</h2>
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

                {/* Delivery Method Selector with Locker Support */}
                {cart && form.shipping?.postalCode && (
                  <DeliveryMethodSelector
                    items={cart.map(item => ({
                      product_id: item.product_id,
                      quantity: item.quantity
                    }))}
                    postalCode={form.shipping.postalCode}
                    paymentMethod={getShippingPaymentMethod(selectedPaymentMethod)}
                    onQuoteReceived={(quote) => {
                      // Auto-select the shipping method from the quote
                      if (quote) {
                        selectShippingMethod({
                          id: 'shipping',
                          name: `${quote.carrier_code} - ${quote.zone_code}`,
                          description: `Παράδοση σε ${quote.estimated_delivery_days} εργάσιμες ημέρες`,
                          price: quote.cost_cents / 100,
                          estimated_days: quote.estimated_delivery_days
                        });
                      }
                    }}
                    className="mt-4"
                  />
                )}
              </div>
            </div>

            {/* Shipping Methods */}
            {shippingMethods && shippingMethods.length > 0 && (
              <div className="border rounded-lg p-4">
                <h2 className="font-semibold mb-4">Μέθοδος Αποστολής</h2>
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

            {/* Payment Methods */}
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold mb-4">Μέθοδος Πληρωμής</h2>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((method) => {
                  const paymentFees = calculatePaymentFees(method, orderSummary?.subtotal || 0);
                  return (
                    <label key={method.id} className="flex items-center">
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={selectedPaymentMethod?.id === method.id}
                        onChange={() => selectPaymentMethod(method)}
                        className="mr-2"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-gray-600">{method.description}</div>
                      </div>
                      {paymentFees > 0 && (
                        <div className="text-sm text-gray-600">
                          +{formatCurrency(paymentFees)} χρέωση
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
{orderSummary && (
              <CartSummary
                orderSummary={{
                  subtotal: orderSummary.subtotal,
                  shipping_cost: orderSummary.shipping_cost,
                  tax_amount: orderSummary.tax_amount,
                  payment_fees: selectedPaymentMethod ? calculatePaymentFees(selectedPaymentMethod, orderSummary.subtotal) : 0,
                  total_amount: orderSummary.subtotal + orderSummary.shipping_cost + orderSummary.tax_amount + (selectedPaymentMethod ? calculatePaymentFees(selectedPaymentMethod, orderSummary.subtotal) : 0)
                }}
                itemsCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
                onCheckout={handleCheckout}
                isLoading={isLoading || isCheckoutBusy}
                disabled={!orderSummary || !selectedPaymentMethod || isCheckoutBusy}
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
      </main>
    </>
  );
}
