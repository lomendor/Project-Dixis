'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardTitle } from '@/components/ui/card';

/**
 * Payment Failure Callback Page
 * Viva redirects here when payment fails or is cancelled
 */
export default function PaymentFailurePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorCode = searchParams.get('ec');

  const getErrorMessage = (code: string | null): string => {
    switch (code) {
      case 'user_cancel':
        return 'Η πληρωμή ακυρώθηκε από τον χρήστη';
      case 'card_declined':
        return 'Η κάρτα απορρίφθηκε. Δοκιμάστε άλλη κάρτα.';
      case 'insufficient_funds':
        return 'Ανεπαρκές υπόλοιπο στην κάρτα';
      case 'expired':
        return 'Η συνεδρία πληρωμής έληξε. Δοκιμάστε ξανά.';
      default:
        return 'Η πληρωμή δεν ολοκληρώθηκε. Δοκιμάστε ξανά.';
    }
  };

  return (
    <main className="max-w-xl mx-auto mt-10 p-4">
      <Card className="p-6">
        <CardTitle className="text-red-600">Αποτυχία πληρωμής</CardTitle>
        <p className="mt-4 text-gray-700">{getErrorMessage(errorCode)}</p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => router.push('/checkout/payment')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Δοκιμάστε ξανά
          </button>
          <button
            onClick={() => router.push('/cart')}
            className="px-4 py-2 border border-gray-300 rounded"
          >
            Επιστροφή στο καλάθι
          </button>
        </div>
      </Card>
    </main>
  );
}
