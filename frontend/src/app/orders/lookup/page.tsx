'use client';

import React from 'react';

export default function OrderLookupPage() {
  const [orderNo, setOrderNo] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch('/api/order-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNo, email }),
      });

      if (!res.ok) {
        if (res.status === 404) {
          setError('Δεν βρέθηκε παραγγελία με αυτά τα στοιχεία.');
        } else if (res.status === 429) {
          setError('Πολλές προσπάθειες. Δοκιμάστε ξανά σε λίγο.');
        } else {
          setError('Παρουσιάστηκε σφάλμα. Δοκιμάστε ξανά.');
        }
        setLoading(false);
        return;
      }

      const data = await res.json();
      setResult(data);
    } catch {
      setError('Σφάλμα δικτύου. Δοκιμάστε ξανά.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Αναζήτηση Παραγγελίας</h1>
      <p className="text-sm text-neutral-600 mb-6">
        Εισάγετε τον αριθμό παραγγελίας (π.χ. DX-20251017-A1B2) και το email σας.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="orderNo" className="block text-sm font-medium mb-1">
            Αριθμός Παραγγελίας
          </label>
          <input
            id="orderNo"
            type="text"
            value={orderNo}
            onChange={(e) => setOrderNo(e.target.value)}
            placeholder="DX-20251017-A1B2"
            className="w-full px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="lookup-order-no"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="w-full px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="lookup-email"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-neutral-400"
          data-testid="lookup-submit"
        >
          {loading ? 'Αναζήτηση...' : 'Αναζήτηση'}
        </button>
      </form>

      {error && (
        <div
          className="mt-4 p-3 bg-red-50 border border-red-300 rounded text-red-800 text-sm"
          data-testid="lookup-error"
        >
          {error}
        </div>
      )}

      {result && (
        <div
          className="mt-6 p-4 bg-green-50 border border-green-300 rounded"
          data-testid="lookup-result"
        >
          <h2 className="text-lg font-semibold mb-3">Στοιχεία Παραγγελίας</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex">
              <dt className="font-medium w-32">Αριθμός:</dt>
              <dd data-testid="result-order-no">{result.orderNo}</dd>
            </div>
            <div className="flex">
              <dt className="font-medium w-32">Ημερομηνία:</dt>
              <dd data-testid="result-created-at">
                {new Date(result.createdAt).toLocaleString('el-GR')}
              </dd>
            </div>
            <div className="flex">
              <dt className="font-medium w-32">Τ.Κ.:</dt>
              <dd data-testid="result-postal-code">{result.postalCode}</dd>
            </div>
            <div className="flex">
              <dt className="font-medium w-32">Μέθοδος:</dt>
              <dd data-testid="result-method">{result.method}</dd>
            </div>
            <div className="flex">
              <dt className="font-medium w-32">Σύνολο:</dt>
              <dd data-testid="result-total">€{Number(result.total).toFixed(2)}</dd>
            </div>
            <div className="flex">
              <dt className="font-medium w-32">Κατάσταση:</dt>
              <dd data-testid="result-status">{result.paymentStatus}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
