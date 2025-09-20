'use client';

import Link from 'next/link';
import { formatCurrency } from '@/env';

export interface OrderSummaryData {
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  payment_fees?: number;
  total_amount: number;
  items?: any[];
  shipping_method?: any;
  payment_method?: any;
  estimates?: any;
}

export interface CartSummaryProps {
  orderSummary: OrderSummaryData;
  onCheckout: () => void;
  itemsCount?: number;
  isLoading?: boolean;
  disabled?: boolean;
  checkoutButtonText?: string;
  className?: string;
  showTitle?: boolean;
  showViewCartLink?: boolean;
}

export default function CartSummary({
  orderSummary,
  onCheckout,
  itemsCount = 0,
  isLoading = false,
  disabled = false,
  checkoutButtonText = 'Ολοκλήρωση Παραγγελίας',
  className = '',
  showTitle = true,
  showViewCartLink = false
}: CartSummaryProps) {
  const {
    subtotal,
    shipping_cost,
    tax_amount,
    payment_fees = 0,
    total_amount
  } = orderSummary;

  return (
    <div className={`border rounded-lg p-4 ${className}`} data-testid="cart-summary">
      {showTitle && (
        <h3 className="font-semibold mb-4" data-testid="summary-title">
          Σύνοψη Παραγγελίας
        </h3>
      )}

      {itemsCount > 0 && (
        <div className="mb-3 text-sm text-gray-600" data-testid="cart-items-count">
          {itemsCount} {itemsCount === 1 ? 'προϊόν' : 'προϊόντα'}
        </div>
      )}

      <div className="space-y-2" data-testid="summary-details">
        <div className="flex justify-between" data-testid="subtotal-row">
          <span>Προϊόντα:</span>
          <span data-testid="subtotal-amount">{formatCurrency(subtotal)}</span>
        </div>
        
        <div className="flex justify-between" data-testid="shipping-row">
          <span>Μεταφορικά:</span>
          <span data-testid="shipping-amount">{formatCurrency(shipping_cost)}</span>
        </div>
        
        {payment_fees > 0 && (
          <div className="flex justify-between" data-testid="payment-fees-row">
            <span>Κόστος πληρωμής:</span>
            <span data-testid="payment-fees-amount">{formatCurrency(payment_fees)}</span>
          </div>
        )}
        
        <div className="flex justify-between" data-testid="tax-row">
          <span>ΦΠΑ (24%):</span>
          <span data-testid="tax-amount">{formatCurrency(tax_amount)}</span>
        </div>
        
        <hr className="my-2" />
        
        <div className="flex justify-between font-bold text-lg" data-testid="total-row">
          <span>Σύνολο:</span>
          <span data-testid="cart-total-amount">{formatCurrency(total_amount)}</span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        disabled={disabled || isLoading}
        className="w-full mt-4 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        data-testid="checkout-btn"
      >
        {isLoading ? 'Επεξεργασία...' : checkoutButtonText}
      </button>

      {showViewCartLink && (
        <Link
          href="/cart"
          className="block text-center mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
          data-testid="cart-view-link"
        >
          Προβολή καλαθιού
        </Link>
      )}
    </div>
  );
}

// Utility function for external usage
export function calculateOrderTotal(
  subtotal: number,
  shipping: number,
  taxRate: number = 0.24,
  paymentFees: number = 0
): OrderSummaryData {
  const tax_amount = subtotal * taxRate;
  const total_amount = subtotal + shipping + tax_amount + paymentFees;

  return {
    subtotal,
    shipping_cost: shipping,
    tax_amount,
    payment_fees: paymentFees,
    total_amount
  };
}