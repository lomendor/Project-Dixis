/**
 * CartSummary Component - Order Summary Display
 * Shows subtotal, shipping, tax, and total amounts
 */

import { formatCurrency } from '@/env';
import { CART_TESTIDS } from '@/lib/testids';

interface OrderSummary {
  subtotal?: number;
  shipping_cost?: number;
  tax_amount?: number;
  total_amount?: number;
}

interface CartSummaryProps {
  orderSummary: OrderSummary;
  className?: string;
}

export default function CartSummary({ orderSummary, className = '' }: CartSummaryProps) {
  return (
    <div className={`border rounded-lg p-4 ${className}`} data-testid={CART_TESTIDS.CART_SUMMARY}>
      <h3 className="font-semibold mb-4">Σύνοψη Παραγγελίας</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Προϊόντα:</span>
          <span data-testid="cart-subtotal">{formatCurrency(orderSummary.subtotal || 0)}</span>
        </div>
        <div className="flex justify-between">
          <span>Μεταφορικά:</span>
          <span data-testid="cart-shipping-cost">{formatCurrency(orderSummary.shipping_cost || 0)}</span>
        </div>
        <div className="flex justify-between">
          <span>ΦΠΑ (24%):</span>
          <span data-testid="cart-tax-amount">{formatCurrency(orderSummary.tax_amount || 0)}</span>
        </div>
        <hr />
        <div className="flex justify-between font-bold text-lg">
          <span>Σύνολο:</span>
          <span data-testid={CART_TESTIDS.CART_TOTAL_AMOUNT}>{formatCurrency(orderSummary.total_amount || 0)}</span>
        </div>
      </div>
    </div>
  );
}