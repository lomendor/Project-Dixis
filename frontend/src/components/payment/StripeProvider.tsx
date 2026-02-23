'use client';

import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Initialize Stripe — null-safe: returns null if key missing or malformed
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const isValidStripeKey = stripeKey && stripeKey.startsWith('pk_');
if (stripeKey && !isValidStripeKey) {
  console.warn('[Dixis] Invalid NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: must start with pk_');
}
const stripePromise = isValidStripeKey ? loadStripe(stripeKey) : null;

interface StripeProviderProps {
  children: React.ReactNode;
  clientSecret?: string;
}

export default function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#16a34a', // Green color matching the design
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#dc2626',
        borderRadius: '6px',
        fontFamily: 'system-ui, sans-serif',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={clientSecret ? options : undefined}>
      {children}
    </Elements>
  );
}