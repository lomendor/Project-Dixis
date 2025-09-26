/**
 * CartSummary Component - Clean cart totals and checkout UI
 * Extracted from cart page for better modularity and testing
 */

import { ShippingQuote } from '@/lib/api';
import { ShippingRetryState } from '@/lib/checkout/shippingRetry';
import { formatCurrency } from '@/env';

interface CartSummaryProps {
  totalAmount: number;
  totalItems: number;
  shippingQuote: ShippingQuote | null;
  retryState: ShippingRetryState;
  useFallbackShipping: boolean;
  checkingOut: boolean;
  hasValidLocation: boolean;
  onCheckout: () => void;
  onRetryShipping: () => void;
}

export default function CartSummary({
  totalAmount,
  totalItems,
  shippingQuote,
  retryState,
  useFallbackShipping,
  checkingOut,
  hasValidLocation,
  onCheckout,
  onRetryShipping
}: CartSummaryProps) {
  const finalTotal = totalAmount + (shippingQuote?.cost || 0);
  const canCheckout = hasValidLocation && !checkingOut && totalItems > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6" data-testid="cart-summary">
      <h3 className="text-lg font-semibold mb-4" data-testid="cart-summary-title">
        Περίληψη Παραγγελίας
      </h3>
      
      {/* Order Totals */}
      <div className="space-y-3 mb-6" data-testid="order-totals">
        <div className="flex justify-between text-sm" data-testid="subtotal-row">
          <span className="text-gray-600">Προϊόντα ({totalItems})</span>
          <span className="font-medium" data-testid="subtotal-amount">
            {formatCurrency(totalAmount)}
          </span>
        </div>
        
        <div className="flex justify-between text-sm" data-testid="shipping-row">
          <span className="text-gray-600">Μεταφορικά</span>
          <ShippingCost 
            retryState={retryState}
            shippingQuote={shippingQuote}
            useFallbackShipping={useFallbackShipping}
            hasValidLocation={hasValidLocation}
            onRetryShipping={onRetryShipping}
          />
        </div>
        
        {/* Shipping Status Messages */}
        {retryState.error && retryState.currentAttempt === retryState.maxAttempts && !retryState.isLoading && (
          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md" data-testid="shipping-warning">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 text-yellow-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.19-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2">
                <p className="text-sm text-yellow-700">
                  Χρησιμοποιείται εκτιμώμενο κόστος μεταφορικών. Το ακριβές κόστος θα υπολογιστεί κατά την επιβεβαίωση.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-3" data-testid="total-row">
          <div className="flex justify-between text-base font-semibold">
            <span>Σύνολο</span>
            <span className="text-green-600" data-testid="total-amount">
              {formatCurrency(finalTotal)}
            </span>
          </div>
        </div>
      </div>

      <button
        data-testid="checkout-cta"
        onClick={onCheckout}
        disabled={!canCheckout}
        className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
          canCheckout
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {checkingOut ? (
          <div className="flex items-center justify-center" data-testid="checkout-loading">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Επεξεργασία...
          </div>
        ) : (
          `Ολοκλήρωση Παραγγελίας ${formatCurrency(finalTotal)}`
        )}
      </button>
      
      {!canCheckout && !checkingOut && (
        <p className="text-sm text-gray-500 mt-2 text-center" data-testid="checkout-disabled-reason">
          {totalItems === 0 
            ? 'Προσθέστε προϊόντα στο καλάθι'
            : 'Συμπληρώστε τα στοιχεία αποστολής'
          }
        </p>
      )}
    </div>
  );
}

// Shipping cost display sub-component
function ShippingCost({
  retryState,
  shippingQuote,
  useFallbackShipping,
  hasValidLocation,
  onRetryShipping
}: {
  retryState: ShippingRetryState;
  shippingQuote: ShippingQuote | null;
  useFallbackShipping: boolean;
  hasValidLocation: boolean;
  onRetryShipping: () => void;
}) {
  if (retryState.isLoading) {
    return (
      <div className="text-right" data-testid="shipping-loading">
        <div className="flex items-center text-sm text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          Υπολογισμός...
        </div>
        {retryState.currentAttempt > 1 && (
          <div className="text-xs text-gray-500">
            Προσπάθεια {retryState.currentAttempt}/{retryState.maxAttempts}
          </div>
        )}
        {retryState.nextRetryIn > 0 && (
          <div className="text-xs text-gray-500">
            Επανάληψη σε {Math.ceil(retryState.nextRetryIn / 1000)}s
          </div>
        )}
      </div>
    );
  }

  if (shippingQuote) {
    return (
      <div className="text-right" data-testid="shipping-cost">
        <span className={`font-medium ${
          useFallbackShipping ? 'text-yellow-600' : 'text-gray-900'
        }`}>
          {formatCurrency(shippingQuote.cost)}
          {useFallbackShipping && (
            <span className="text-xs text-yellow-600 ml-1">(εκτ.)</span>
          )}
        </span>
        <div className="text-xs text-gray-500">{shippingQuote.carrier}</div>
        <div className="text-xs text-gray-500">{shippingQuote.etaDays} ημέρες</div>
        {useFallbackShipping && (
          <div className="text-xs text-yellow-600">Εκτιμώμενο κόστος</div>
        )}
      </div>
    );
  }

  if (retryState.error && !retryState.isLoading) {
    return (
      <div className="text-right" data-testid="shipping-error">
        <span className="text-sm text-red-500">Σφάλμα υπολογισμού</span>
        <button
          onClick={onRetryShipping}
          className="block text-xs text-blue-600 hover:text-blue-700 underline mt-1"
          data-testid="retry-shipping-btn"
        >
          Δοκιμή ξανά
        </button>
      </div>
    );
  }

  if (!hasValidLocation) {
    return (
      <span className="text-sm text-gray-500" data-testid="shipping-prompt">
        Εισάγετε ΤΚ & πόλη
      </span>
    );
  }

  return (
    <span className="text-sm text-gray-500">Εισάγετε έγκυρο ΤΚ</span>
  );
}