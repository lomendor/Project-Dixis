'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

interface SubStatus {
  has_active_subscription: boolean;
  price_cents: number;
  subscription?: { id: number; status: string; starts_at: string; expires_at: string };
}

export default function SubscriptionPage() {
  const [data, setData] = useState<SubStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient
      .getSubscriptionStatus()
      .then(setData)
      .catch(() => setError('Δεν ήταν δυνατή η φόρτωση.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const { checkout_url } = await apiClient.createSubscriptionCheckout();
      window.location.href = checkout_url;
    } catch (err: any) {
      setError(err?.status === 409 ? 'Η συνδρομή σας είναι ήδη ενεργή.' : 'Σφάλμα. Δοκιμάστε ξανά.');
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return <p className="text-center text-neutral-500 py-12">Φόρτωση...</p>;
  }
  if (error && !data) {
    return <p className="text-center text-red-600 py-12">{error}</p>;
  }

  const priceEur = data ? (data.price_cents / 100).toFixed(2) : '0';
  const sub = data?.subscription;
  const isActive = data?.has_active_subscription;

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-neutral-800">Συνδρομή B2B</h1>

      {isActive && sub ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="font-semibold text-green-800">Ενεργή</span>
          </div>
          <p className="text-sm text-neutral-600">
            Ισχύει έως {new Date(sub.expires_at).toLocaleDateString('el-GR')}
          </p>
          <p className="text-sm text-neutral-500">
            Με ενεργή συνδρομή απολαμβάνετε <strong>0% προμήθεια</strong> στις παραγγελίες σας.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-neutral-800">Ετήσια Συνδρομή</h2>
          <p className="text-3xl font-bold text-blue-700">{priceEur}€<span className="text-sm font-normal text-neutral-500">/έτος</span></p>
          <ul className="text-sm text-neutral-600 space-y-1">
            <li>0% προμήθεια στις παραγγελίες (αντί 7%)</li>
            <li>Πρόσβαση σε αποκλειστικά χονδρικά προϊόντα</li>
            <li>Προτεραιότητα υποστήριξης</li>
          </ul>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {checkoutLoading ? 'Μεταφορά στο Stripe...' : 'Εγγραφή τώρα'}
          </button>
        </div>
      )}
    </div>
  );
}
