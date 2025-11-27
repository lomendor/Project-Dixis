'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardTitle } from '@/components/ui/card';

/**
 * Payment Success Callback Page
 * Viva redirects here after successful payment
 * Query params: t (transactionId), s (orderCode), lang
 */

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    async function verifyPayment() {
      const transactionId = searchParams.get('t');
      const orderCode = searchParams.get('s');
      const storedOrderId = localStorage.getItem('checkout_pending_order_id');
      const storedVivaOrderCode = localStorage.getItem('checkout_viva_order_code');

      // Verify the order code matches what we stored
      if (orderCode && storedVivaOrderCode && orderCode !== storedVivaOrderCode) {
        setStatus('error');
        setError('Τα στοιχεία πληρωμής δεν ταιριάζουν');
        return;
      }

      try {
        const response = await fetch('/api/checkout/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: storedOrderId,
            vivaOrderCode: orderCode || storedVivaOrderCode,
            transactionId,
          }),
        });

        const result = await response.json();

        if (result.success) {
          setStatus('success');
          setOrderId(result.orderId || storedOrderId);
          // Clean up localStorage
          localStorage.removeItem('checkout_pending_order_id');
          localStorage.removeItem('checkout_viva_order_code');
          localStorage.removeItem('checkout_last_summary');
          // Store confirmed order for confirmation page
          localStorage.setItem('checkout_order_id', result.orderId);
          if (result.orderNumber) {
            localStorage.setItem('checkout_order_no', result.orderNumber);
          }
        } else {
          setStatus('error');
          setError(result.error || 'Αποτυχία επιβεβαίωσης πληρωμής');
        }
      } catch {
        setStatus('error');
        setError('Σφάλμα επικοινωνίας με τον server');
      }
    }

    verifyPayment();
  }, [searchParams]);

  if (status === 'verifying') {
    return (
      <Card className="p-6 text-center">
        <div className="animate-pulse">
          <p className="text-lg">Επαλήθευση πληρωμής...</p>
          <p className="text-sm text-gray-500 mt-2">Παρακαλώ περιμένετε</p>
        </div>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card className="p-6">
        <CardTitle className="text-red-600">Πρόβλημα με την πληρωμή</CardTitle>
        <p className="mt-4">{error}</p>
        <button
          onClick={() => router.push('/checkout/payment')}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          Δοκιμάστε ξανά
        </button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <CardTitle className="text-green-600">Η πληρωμή ολοκληρώθηκε!</CardTitle>
      <p className="mt-4">
        Η παραγγελία σας {orderId && <strong>#{orderId}</strong>} καταχωρήθηκε επιτυχώς.
      </p>
      <button
        onClick={() => router.push('/checkout/confirmation')}
        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
      >
        Δείτε την παραγγελία
      </button>
    </Card>
  );
}

export default function PaymentSuccessPage() {
  return (
    <main className="max-w-xl mx-auto mt-10 p-4">
      <Suspense fallback={
        <Card className="p-6 text-center">
          <div className="animate-pulse">
            <p className="text-lg">Φόρτωση...</p>
          </div>
        </Card>
      }>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
