/**
 * Payment Methods Tests
 * Unit tests for payment method configuration and utilities
 */

import { describe, it, expect } from 'vitest';
import {
  PAYMENT_METHODS,
  getPaymentMethodById,
  getDefaultPaymentMethod,
  calculatePaymentFees
} from '../paymentMethods';

describe('Payment Methods Configuration', () => {
  it('should have valid payment methods', () => {
    expect(PAYMENT_METHODS).toHaveLength(2);

    const codMethod = PAYMENT_METHODS[0];
    expect(codMethod.id).toBe('cash_on_delivery');
    expect(codMethod.type).toBe('cash_on_delivery');
    expect(codMethod.name).toBe('Αντικαταβολή');
    expect(codMethod.fixed_fee).toBe(2.00);

    const cardMethod = PAYMENT_METHODS[1];
    expect(cardMethod.id).toBe('card');
    expect(cardMethod.type).toBe('card');
    expect(cardMethod.name).toBe('Κάρτα (Stripe)');
    expect(cardMethod.fee_percentage).toBe(2.9);
    expect(cardMethod.fixed_fee).toBe(0.30);
  });

  it('should find payment method by ID', () => {
    const codMethod = getPaymentMethodById('cash_on_delivery');
    expect(codMethod).toBeDefined();
    expect(codMethod?.id).toBe('cash_on_delivery');

    const cardMethod = getPaymentMethodById('card');
    expect(cardMethod).toBeDefined();
    expect(cardMethod?.id).toBe('card');

    const nonExistentMethod = getPaymentMethodById('nonexistent');
    expect(nonExistentMethod).toBeUndefined();
  });

  it('should return default payment method', () => {
    const defaultMethod = getDefaultPaymentMethod();
    expect(defaultMethod.id).toBe('cash_on_delivery');
  });

  it('should calculate payment fees correctly', () => {
    const codMethod = getPaymentMethodById('cash_on_delivery')!;
    const cardMethod = getPaymentMethodById('card')!;

    // Cash on delivery: fixed fee only
    expect(calculatePaymentFees(codMethod, 100)).toBe(2.00);
    expect(calculatePaymentFees(codMethod, 50)).toBe(2.00);

    // Card payment: percentage + fixed fee
    expect(calculatePaymentFees(cardMethod, 100)).toBe(3.20); // 2.9% of 100 + 0.30 = 2.90 + 0.30 = 3.20
    expect(calculatePaymentFees(cardMethod, 50)).toBe(1.75);  // 2.9% of 50 + 0.30 = 1.45 + 0.30 = 1.75

    // Edge case: zero amount
    expect(calculatePaymentFees(codMethod, 0)).toBe(2.00);
    expect(calculatePaymentFees(cardMethod, 0)).toBe(0.30);
  });

  it('should handle payment methods without fees', () => {
    const methodWithoutFees = {
      id: 'test',
      type: 'card' as const,
      name: 'Test Method',
    };

    expect(calculatePaymentFees(methodWithoutFees, 100)).toBe(0);
  });
});