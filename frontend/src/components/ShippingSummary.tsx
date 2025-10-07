'use client';

import { useState, useEffect } from 'react';

interface ShippingSummaryProps {
  subtotal: number;
}

export default function ShippingSummary({ subtotal }: ShippingSummaryProps) {
  const [quote, setQuote] = useState<{ subtotal: number; shipping: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuote() {
      try {
        const res = await fetch('/api/checkout/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subtotal })
        });
        const data = await res.json();
        setQuote(data);
      } catch (e) {
        console.error('Failed to fetch quote:', e);
      } finally {
        setLoading(false);
      }
    }

    if (subtotal > 0) {
      fetchQuote();
    }
  }, [subtotal]);

  if (loading) return <div>Υπολογισμός...</div>;
  if (!quote) return <div>Αδυναμία υπολογισμού</div>;

  const formatter = new Intl.NumberFormat('el-GR', {
    style: 'currency',
    currency: 'EUR'
  });

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <h3 className="font-semibold text-lg mb-3">Σύνοψη Κόστους</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Υποσύνολο:</span>
          <span>{formatter.format(quote.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Μεταφορικά:</span>
          <span className={quote.shipping === 0 ? 'text-green-600 font-medium' : ''}>
            {quote.shipping === 0 ? 'Δωρεάν' : formatter.format(quote.shipping)}
          </span>
        </div>
        <div className="border-t border-gray-300 pt-2 mt-2">
          <div className="flex justify-between font-semibold">
            <span>Σύνολο:</span>
            <span className="text-green-600">{formatter.format(quote.total)}</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-600 mt-3">
        * Δωρεάν μεταφορικά για παραγγελίες άνω των {formatter.format(35)}
      </p>
    </div>
  );
}
