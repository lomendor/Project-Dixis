/**
 * CartSummary Component Unit Tests
 * PR-88c-3: Cart UI Wire-up with useCheckout Hook
 * 
 * Tests order summary rendering, totals calculation, and checkout states
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartSummary } from '../../src/components/cart/CartSummary';
import type { OrderSummary, ShippingMethod, PaymentMethod } from '../../src/lib/validation/checkout';

const mockOrderSummary: OrderSummary = {
  items: [
    { id: 1, product_id: 123, name: 'Greek Oil', price: 15.50, quantity: 2, subtotal: 31.00, producer_name: 'Farm' }
  ],
  subtotal: 31.00,
  shipping_method: { id: 'courier', name: 'Courier', price: 5.50, estimated_days: 2 },
  shipping_cost: 5.50,
  payment_method: { id: 'cod', type: 'cash_on_delivery', name: 'Cash on Delivery', fixed_fee: 0 },
  payment_fees: 0,
  tax_amount: 7.44,
  total_amount: 43.94
};

const mockShippingMethod: ShippingMethod = {
  id: 'courier',
  name: 'Courier Delivery',
  price: 5.50,
  estimated_days: 2
};

const mockPaymentMethod: PaymentMethod = {
  id: 'cod',
  type: 'cash_on_delivery',
  name: 'Cash on Delivery',
  fixed_fee: 0
};

describe('CartSummary Component', () => {
  const mockOnCheckout = vi.fn();
  const mockOnSelectShipping = vi.fn();
  const mockOnSelectPayment = vi.fn();

  beforeEach(() => {
    mockOnCheckout.mockClear();
    mockOnSelectShipping.mockClear();
    mockOnSelectPayment.mockClear();
  });

  it('renders order summary with correct totals', () => {
    render(
      <CartSummary
        summary={mockOrderSummary}
        shippingMethods={[mockShippingMethod]}
        selectedShippingMethod={mockShippingMethod}
        selectedPaymentMethod={mockPaymentMethod}
        onCheckout={mockOnCheckout}
        onSelectShippingMethod={mockOnSelectShipping}
        onSelectPaymentMethod={mockOnSelectPayment}
        isProcessing={false}
        isLoadingShipping={false}
      />
    );

    expect(screen.getByText('Σύνοψη Παραγγελίας')).toBeInTheDocument();
    expect(screen.getByText('Προϊόντα (2)')).toBeInTheDocument();
    expect(screen.getByText('31,00 €')).toBeInTheDocument(); // Subtotal
    expect(screen.getByText('5,50 €')).toBeInTheDocument(); // Shipping
    expect(screen.getByText('7,44 €')).toBeInTheDocument(); // Tax
    expect(screen.getByText('43,94 €')).toBeInTheDocument(); // Total
  });

  it('shows loading state for shipping calculation', () => {
    render(
      <CartSummary
        summary={mockOrderSummary}
        shippingMethods={null}
        selectedShippingMethod={null}
        selectedPaymentMethod={null}
        onCheckout={mockOnCheckout}
        onSelectShippingMethod={mockOnSelectShipping}
        onSelectPaymentMethod={mockOnSelectPayment}
        isProcessing={false}
        isLoadingShipping={true}
      />
    );

    expect(screen.getByText('Υπολογισμός...')).toBeInTheDocument();
    expect(screen.getByText('Υπολογισμός μεταφορικών...')).toBeInTheDocument();
  });

  it('shows processing state during checkout', () => {
    render(
      <CartSummary
        summary={mockOrderSummary}
        shippingMethods={[mockShippingMethod]}
        selectedShippingMethod={mockShippingMethod}
        selectedPaymentMethod={mockPaymentMethod}
        onCheckout={mockOnCheckout}
        onSelectShippingMethod={mockOnSelectShipping}
        onSelectPaymentMethod={mockOnSelectPayment}
        isProcessing={true}
        isLoadingShipping={false}
      />
    );

    expect(screen.getByText('Επεξεργασία...')).toBeInTheDocument();
    expect(screen.getByTestId('checkout-btn')).toBeDisabled();
  });

  it('handles checkout button click correctly', () => {
    render(
      <CartSummary
        summary={mockOrderSummary}
        shippingMethods={[mockShippingMethod]}
        selectedShippingMethod={mockShippingMethod}
        selectedPaymentMethod={mockPaymentMethod}
        onCheckout={mockOnCheckout}
        onSelectShippingMethod={mockOnSelectShipping}
        onSelectPaymentMethod={mockOnSelectPayment}
        isProcessing={false}
        isLoadingShipping={false}
      />
    );

    const checkoutBtn = screen.getByTestId('checkout-btn');
    fireEvent.click(checkoutBtn);

    expect(mockOnCheckout).toHaveBeenCalledTimes(1);
  });

  it('disables checkout when cart is empty', () => {
    const emptySummary: OrderSummary = {
      ...mockOrderSummary,
      items: [],
      subtotal: 0,
      total_amount: 0
    };

    render(
      <CartSummary
        summary={emptySummary}
        shippingMethods={[mockShippingMethod]}
        selectedShippingMethod={mockShippingMethod}
        selectedPaymentMethod={mockPaymentMethod}
        onCheckout={mockOnCheckout}
        onSelectShippingMethod={mockOnSelectShipping}
        onSelectPaymentMethod={mockOnSelectPayment}
        isProcessing={false}
        isLoadingShipping={false}
      />
    );

    expect(screen.getByText('Το καλάθι είναι κενό')).toBeInTheDocument();
    expect(screen.getByTestId('checkout-btn')).toBeDisabled();
  });

  it('shows shipping method details when selected', () => {
    render(
      <CartSummary
        summary={mockOrderSummary}
        shippingMethods={[mockShippingMethod]}
        selectedShippingMethod={mockShippingMethod}
        selectedPaymentMethod={mockPaymentMethod}
        onCheckout={mockOnCheckout}
        onSelectShippingMethod={mockOnSelectShipping}
        onSelectPaymentMethod={mockOnSelectPayment}
        isProcessing={false}
        isLoadingShipping={false}
      />
    );

    expect(screen.getByText('Courier Delivery')).toBeInTheDocument();
    expect(screen.getByText('2 ημέρες')).toBeInTheDocument();
    expect(screen.getByText('✅ Επιλεγμένη παράδοση: Courier Delivery')).toBeInTheDocument();
  });

  it('shows payment fees when applicable', () => {
    const summaryWithFees: OrderSummary = {
      ...mockOrderSummary,
      payment_fees: 2.50,
      total_amount: 46.44
    };

    render(
      <CartSummary
        summary={summaryWithFees}
        shippingMethods={[mockShippingMethod]}
        selectedShippingMethod={mockShippingMethod}
        selectedPaymentMethod={mockPaymentMethod}
        onCheckout={mockOnCheckout}
        onSelectShippingMethod={mockOnSelectShipping}
        onSelectPaymentMethod={mockOnSelectPayment}
        isProcessing={false}
        isLoadingShipping={false}
      />
    );

    expect(screen.getByText('Έξοδα πληρωμής')).toBeInTheDocument();
    expect(screen.getByText('2,50 €')).toBeInTheDocument();
  });
});