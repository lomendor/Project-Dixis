'use client';

import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useToast } from '@/contexts/ToastContext';
import { useTranslations } from '@/contexts/LocaleContext';

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
  const t = useTranslations();
  const [isProcessing, setIsProcessing] = useState(false);
  const [stripeTimedOut, setStripeTimedOut] = useState(false);

  // After 5s without Stripe loading, show a permanent error instead of "please wait"
  useEffect(() => {
    if (stripe) return undefined; // Already loaded — no cleanup needed
    const timer = setTimeout(() => { setStripeTimedOut(true) }, 5000);
    return () => clearTimeout(timer);
  }, [stripe]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Pass PAY-CARD-CONFIRM-GUARD-01: Strict null guards before Stripe call
    if (!stripe) {
      onPaymentError(stripeTimedOut
        ? t('stripe.serviceUnavailable')
        : t('stripe.notLoaded'));
      return;
    }

    if (!elements) {
      onPaymentError(t('stripe.formNotLoaded'));
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
        const errorMessage = error.message || t('stripe.processingError');
        onPaymentError(errorMessage);
        showToast('error', errorMessage);
        return;
      }

      // Case 2: No error but paymentIntent is null/undefined
      if (!paymentIntent) {
        onPaymentError(t('stripe.paymentIncomplete'));
        return;
      }

      // Case 3: PaymentIntent exists but has no ID (malformed)
      if (!paymentIntent.id) {
        onPaymentError(t('stripe.paymentMalformed'));
        return;
      }

      // Case 4: PaymentIntent succeeded - call backend to confirm
      if (paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent.id);
        return;
      }

      // Case 5: PaymentIntent has a status that requires action (3D Secure, etc.)
      if (paymentIntent.status === 'requires_action') {
        onPaymentError(t('stripe.requires3ds'));
        return;
      }

      // Case 6: Other statuses (processing, requires_payment_method, etc.)
      onPaymentError(t('stripe.unknownStatus', { status: paymentIntent.status }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('stripe.unexpectedError');
      onPaymentError(`${t('stripe.unexpectedError')}: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg">
        <PaymentElement />
      </div>

      <div className="text-sm text-neutral-600">
        <p>{t('stripe.totalAmount')}: <strong>€{amount.toFixed(2)}</strong></p>
        <p>{t('stripe.securePayment')}</p>
      </div>

      <button
        type="submit"
        disabled={!stripe || disabled || isProcessing}
        className="w-full px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-light disabled:bg-neutral-400 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? t('stripe.processing') : `${t('stripe.pay')} €${amount.toFixed(2)}`}
      </button>
    </form>
  );
}