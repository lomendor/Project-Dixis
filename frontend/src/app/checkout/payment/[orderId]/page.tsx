'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { paymentApi } from '@/lib/api/payment';
import { formatCurrency } from '@/env';
import Navigation from '@/components/Navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';
import StripeProvider from '@/components/payment/StripeProvider';
import StripePaymentForm from '@/components/payment/StripePaymentForm';

interface Order {
  id: number;
  total_amount: string;
  payment_status: string;
  status: string;
  items: Array<{
    id: number;
    product_id: number;
    quantity: number;
    price: string;
  }>;
}

export default function PaymentPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

initializePayment();
  }, [orderId, isAuthenticated, authLoading, router, initializePayment]);

const initializePayment = useCallback(async () => {
    if (!orderId || Array.isArray(orderId)) return;

    setIsLoading(true);
    setError(null);

    try {
      const orderIdNum = parseInt(orderId);

      // Initialize payment intent with the backend
      const paymentResponse = await paymentApi.initPayment(orderIdNum, {
        customer: {
          email: user?.email,
          firstName: user?.name?.split(' ')[0],
          lastName: user?.name?.split(' ').slice(1).join(' '),
        },
        return_url: `${window.location.origin}/orders/${orderId}/confirmation`,
      });

      setClientSecret(paymentResponse.payment.client_secret);
      setOrder({
        id: paymentResponse.order.id,
        total_amount: paymentResponse.order.total_amount,
        payment_status: paymentResponse.order.payment_status,
        status: 'pending',
        items: []
      });

    } catch (err) {
      console.error('Payment initialization failed:', err);
      setError(err instanceof Error ? err.message : 'Σφάλμα κατά την προετοιμασία πληρωμής');
      showToast('error', 'Σφάλμα κατά την προετοιμασία πληρωμής');
} finally {
      setIsLoading(false);
    }
}, [orderId, user?.email, user?.name, showToast]);

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!order) return;

    setIsProcessingPayment(true);

    try {
      await paymentApi.confirmPayment(order.id, paymentIntentId);
      showToast('success', 'Η πληρωμή ολοκληρώθηκε επιτυχώς');
      router.push(`/orders/${order.id}?payment=success`);
    } catch (err) {
      console.error('Payment confirmation failed:', err);
      showToast('error', 'Σφάλμα κατά την επιβεβαίωση πληρωμής');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    showToast('error', errorMessage);
  };

  const handleCancel = () => {
    router.push('/cart');
  };

  if (authLoading || isLoading) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <LoadingSpinner />
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <ErrorState
            message={error}
            onRetry={() => initializePayment()}
          />
          <div className="text-center mt-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Επιστροφή στο καλάθι
            </button>
          </div>
        </main>
      </>
    );
  }

  if (!order || !clientSecret) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <ErrorState message="Δεν βρέθηκε η παραγγελία" onRetry={initializePayment} />
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Πληρωμή Παραγγελίας</h1>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Στοιχεία Παραγγελίας</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Παραγγελία:</span>
                <span className="font-medium">#{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Συνολικό ποσό:</span>
                <span className="font-bold text-lg">{formatCurrency(parseFloat(order.total_amount))}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Πληρωμή με Κάρτα</h2>

            <StripeProvider clientSecret={clientSecret}>
              <StripePaymentForm
                amount={parseFloat(order.total_amount)}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                disabled={isProcessingPayment}
              />
            </StripeProvider>

            <div className="mt-6 pt-4 border-t">
              <button
                onClick={handleCancel}
                disabled={isProcessingPayment}
                className="text-gray-600 hover:text-gray-800 disabled:text-gray-400"
              >
                Ακύρωση και επιστροφή στο καλάθι
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}