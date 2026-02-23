/**
 * Payment Methods Configuration
 * COD removed — multi-producer marketplace makes flat COD fee impossible.
 */

import type { PaymentMethod } from '../validation/checkout';

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'card',
    type: 'card',
    name: 'Κάρτα (Stripe)',
    description: 'Ασφαλής πληρωμή με κάρτα μέσω Stripe',
    fee_percentage: 2.9,
    fixed_fee: 0.30,
  }
];

export function getPaymentMethodById(id: string): PaymentMethod | undefined {
  return PAYMENT_METHODS.find(method => method.id === id);
}

export function getDefaultPaymentMethod(): PaymentMethod {
  return PAYMENT_METHODS[0]; // Card only
}

export function calculatePaymentFees(paymentMethod: PaymentMethod, subtotal: number): number {
  const percentageFee = (paymentMethod.fee_percentage || 0) * subtotal / 100;
  const fixedFee = paymentMethod.fixed_fee || 0;
  return Math.round((percentageFee + fixedFee) * 100) / 100;
}
