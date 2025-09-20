'use client';

import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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