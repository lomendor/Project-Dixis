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

    if (!stripe || !elements) {
      onPaymentError('Stripe δεν έχει φορτώσει ακόμα');
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders/confirmation`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Payment error:', error);
        const errorMessage = error.message || 'Σφάλμα κατά την επεξεργασία πληρωμής';
        onPaymentError(errorMessage);
        showToast('error', errorMessage);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Don't show success toast here - let parent confirm with backend first
        // Parent's onPaymentSuccess handler will show success after backend confirmation
        onPaymentSuccess(paymentIntent.id);
      } else {
        onPaymentError('Η πληρωμή απαιτεί επιπλέον ενέργειες');
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      onPaymentError('Απροσδόκητο σφάλμα κατά την επεξεργασία πληρωμής');
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