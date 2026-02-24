/**
 * Payment Methods Configuration
 * Defines available payment methods for the checkout process
 */

import type { PaymentMethod } from '../validation/checkout';

export const PAYMENT_METHODS: PaymentMethod[] = [
  // COD gated by env flag — can be re-enabled with NEXT_PUBLIC_ENABLE_COD=true
  ...(process.env.NEXT_PUBLIC_ENABLE_COD === 'true' ? [{
    id: 'cash_on_delivery' as const,
    type: 'cash_on_delivery' as const,
    name: 'Αντικαταβολή',
    description: 'Πληρωμή κατά την παραλαβή',
    fixed_fee: 2.00,
  }] : []),
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
  // When COD is disabled, first item is card
  return PAYMENT_METHODS[0];
}

export function calculatePaymentFees(paymentMethod: PaymentMethod, subtotal: number): number {
  const percentageFee = (paymentMethod.fee_percentage || 0) * subtotal / 100;
  const fixedFee = paymentMethod.fixed_fee || 0;
  return Math.round((percentageFee + fixedFee) * 100) / 100;
}