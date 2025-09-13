/**
 * CartSummary Component - Order Totals & Checkout
 * PR-88c-3: Cart UI Wire-up with useCheckout Hook
 * 
 * Extracted from existing cart page (lines 483-742)
 * Full shipping, payment, and total calculation logic
 * ~95 LOC with comprehensive order summary
 */

import { formatCurrency } from '@/env';
import type { CartSummaryProps } from './types';

export function CartSummary({
  summary,
  shippingMethods,
  selectedShippingMethod,
  selectedPaymentMethod,
  onCheckout,
  onSelectShippingMethod,
  onSelectPaymentMethod,
  isProcessing,
  isLoadingShipping
}: CartSummaryProps) {
  const totalItems = summary?.items.reduce((total, item) => total + item.quantity, 0) || 0;
  const subtotal = summary?.subtotal || 0;
  const shippingCost = summary?.shipping_cost || 0;
  const paymentFees = summary?.payment_fees || 0;
  const taxAmount = summary?.tax_amount || 0;
  const total = summary?.total_amount || (subtotal + shippingCost + paymentFees + taxAmount);

  // Determine checkout button state and text
  const getCheckoutButtonState = () => {
    if (isProcessing) {
      return {
        disabled: true,
        className: 'bg-gray-400 cursor-not-allowed text-white',
        text: (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Επεξεργασία...
          </div>
        )
      };
    }
    if (!summary || totalItems === 0) {
      return {
        disabled: true,
        className: 'bg-gray-400 cursor-not-allowed text-white',
        text: 'Το καλάθι είναι κενό'
      };
    }
    if (isLoadingShipping) {
      return {
        disabled: true,
        className: 'bg-gray-400 cursor-not-allowed text-white',
        text: 'Υπολογισμός μεταφορικών...'
      };
    }
    return {
      disabled: false,
      className: 'bg-green-600 hover:bg-green-700 text-white',
      text: 'Ολοκλήρωση Παραγγελίας'
    };
  };

  const buttonState = getCheckoutButtonState();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Σύνοψη Παραγγελίας
      </h2>
      
      {/* Order Totals - Enhanced with tax and fees */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Προϊόντα ({totalItems})</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Μεταφορικά</span>
          {isLoadingShipping ? (
            <div className="text-right">
              <div className="flex items-center text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Υπολογισμός...
              </div>
            </div>
          ) : selectedShippingMethod ? (
            <div className="text-right">
              <span className="font-medium">{formatCurrency(shippingCost)}</span>
              <div className="text-xs text-gray-500">{selectedShippingMethod.name}</div>
              <div className="text-xs text-gray-500">{selectedShippingMethod.estimated_days} ημέρες</div>
            </div>
          ) : (
            <span className="text-sm text-gray-500">Δεν έχει επιλεγεί</span>
          )}
        </div>

        {paymentFees > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Έξοδα πληρωμής</span>
            <span className="font-medium">{formatCurrency(paymentFees)}</span>
          </div>
        )}

        {taxAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">ΦΠΑ (24%)</span>
            <span className="font-medium">{formatCurrency(taxAmount)}</span>
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between text-base font-semibold">
            <span>Σύνολο</span>
            <span className="text-green-600">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Checkout Button - Enhanced with comprehensive states */}
      <button
        data-testid="checkout-btn"
        onClick={onCheckout}
        disabled={buttonState.disabled}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${buttonState.className}`}
      >
        {buttonState.text}
      </button>

      {/* Footer Information */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Πληρωμή με αντικαταβολή. Μεταφορικά υπολογίζονται βάση της τοποθεσίας.
        </p>
        {selectedShippingMethod && (
          <p className="text-xs text-green-600 mt-1">
            ✅ Επιλεγμένη παράδοση: {selectedShippingMethod.name}
          </p>
        )}
      </div>
    </div>
  );
}