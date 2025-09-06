/**
 * CartSummary Component - Order Totals & Checkout
 * PR-88c-3: Cart UI Wire-up with useCheckout Hook
 * 
 * Extracts order summary logic from existing cart page
 * Wires checkout flow to useCheckout hook methods
 * ~60 LOC target with full implementation
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
  const total = subtotal + shippingCost;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Σύνοψη Παραγγελίας
      </h2>
      
      {/* Order Totals */}
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
          ) : (
            <span className="font-medium">{formatCurrency(shippingCost)}</span>
          )}
        </div>
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between text-base font-semibold">
            <span>Σύνολο</span>
            <span className="text-green-600">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        data-testid="checkout-btn"
        onClick={onCheckout}
        disabled={isProcessing || !summary}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          isProcessing || !summary
            ? 'bg-gray-400 cursor-not-allowed text-white'
            : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Επεξεργασία...
          </div>
        ) : (
          'Ολοκλήρωση Παραγγελίας'
        )}
      </button>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Πληρωμή με αντικαταβολή. Μεταφορικά υπολογίζονται βάση της τοποθεσίας.
        </p>
      </div>
    </div>
  );
}