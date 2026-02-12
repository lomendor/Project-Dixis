'use client';

import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useToast } from '@/contexts/ToastContext';

interface StripePaymentFormProps {
  amount: number;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  disabled?: boolean;
}

export default function StripePaymentForm({
  amount,
  onPaymentSuccess,
  onPaymentError,
  disabled = false
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Pass PAY-CARD-CONFIRM-GUARD-01: Strict null guards before Stripe call
    if (!stripe) {
      console.error('[StripePaymentForm] stripe is null - not loaded');
      onPaymentError('Stripe δεν έχει φορτώσει ακόμα. Παρακαλώ περιμένετε.');
      return;
    }

    if (!elements) {
      console.error('[StripePaymentForm] elements is null - not initialized');
      onPaymentError('Η φόρμα πληρωμής δεν έχει φορτώσει. Παρακαλώ ανανεώστε τη σελίδα.');
      return;
    }

    setIsProcessing(true);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders/confirmation`,
        },
        redirect: 'if_required',
      });

      const { error, paymentIntent } = result;

      // Case 1: Stripe returned an error
      if (error) {
        console.error('[StripePaymentForm] Payment error:', error.type, error.code, error.message);
        const errorMessage = error.message || 'Σφάλμα κατά την επεξεργασία πληρωμής';
        onPaymentError(errorMessage);
        showToast('error', errorMessage);
        return;
      }

      // Case 2: No error but paymentIntent is null/undefined
      // This can happen with certain Stripe configurations - treat as error
      if (!paymentIntent) {
        console.error('[StripePaymentForm] No error but paymentIntent is null');
        onPaymentError('Η πληρωμή δεν ολοκληρώθηκε. Παρακαλώ δοκιμάστε ξανά.');
        return;
      }

      // Case 3: PaymentIntent exists but has no ID (malformed)
      if (!paymentIntent.id) {
        console.error('[StripePaymentForm] paymentIntent has no id:', paymentIntent);
        onPaymentError('Η πληρωμή δεν ολοκληρώθηκε σωστά. Παρακαλώ δοκιμάστε ξανά.');
        return;
      }

      // Case 4: PaymentIntent succeeded - call backend to confirm
      if (paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent.id);
        return;
      }

      // Case 5: PaymentIntent has a status that requires action (3D Secure, etc.)
      if (paymentIntent.status === 'requires_action') {
        console.warn('[StripePaymentForm] requires_action - 3D Secure or additional verification needed');
        onPaymentError('Η πληρωμή απαιτεί επιπλέον επαλήθευση (3D Secure). Παρακαλώ δοκιμάστε ξανά.');
        return;
      }

      // Case 6: Other statuses (processing, requires_payment_method, etc.)
      console.warn('[StripePaymentForm] Unexpected paymentIntent status:', paymentIntent.status);
      onPaymentError(`Η πληρωμή είναι σε κατάσταση: ${paymentIntent.status}. Παρακαλώ δοκιμάστε ξανά.`);

    } catch (err) {
      // Pass PAY-CARD-CONFIRM-GUARD-01: Better error logging for unexpected errors
      console.error('[StripePaymentForm] Unexpected error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Απροσδόκητο σφάλμα';
      onPaymentError(`Απροσδόκητο σφάλμα κατά την επεξεργασία πληρωμής: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg">
        <PaymentElement />
      </div>

      <div className="text-sm text-gray-600">
        <p>Συνολικό ποσό: <strong>€{amount.toFixed(2)}</strong></p>
        <p>Ασφαλής πληρωμή μέσω Stripe</p>
      </div>

      <button
        type="submit"
        disabled={!stripe || disabled || isProcessing}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? 'Επεξεργασία...' : `Πληρωμή €${amount.toFixed(2)}`}
      </button>
    </form>
  );
}