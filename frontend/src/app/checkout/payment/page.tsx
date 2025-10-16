'use client';
import React from 'react';
import { Card, CardTitle } from '../../../components/ui/card';
import { formatEUR } from '../../../lib/money';

export default function PaymentStub() {
  const [json, setJson] = React.useState<any>(null);

  React.useEffect(() => {
    try {
      setJson(
        JSON.parse(localStorage.getItem('checkout_last_summary') || 'null')
      );
    } catch {}
  }, []);

  return (
    <main style={{ maxWidth: 760, margin: '40px auto', padding: 16 }}>
      <h2 style={{ margin: 0 }}>Πληρωμή (stub)</h2>
      <p style={{ color: '#6b7280', marginTop: 6 }}>
        Εδώ θα γίνει η πραγματική πληρωμή σε επόμενο pass.
      </p>
      <Card>
        <CardTitle>Σύνοψη παραγγελίας</CardTitle>
        <div className="mt-3 text-sm">
          {!json ? (
            'Δεν βρέθηκαν στοιχεία.'
          ) : (
            <ul className="list-disc pl-5">
              <li>
                Τ.Κ.: <strong>{json?.address?.postalCode}</strong>
              </li>
              <li>
                Μέθοδος: <strong>{json?.method}</strong>
              </li>
              <li>
                Βάρος: <strong>{(json?.weight / 1000).toFixed(2)} kg</strong>
              </li>
              <li>
                Subtotal: <strong>{formatEUR(json?.subtotal)}</strong>
              </li>
              <li>
                Μεταφορικά:{' '}
                <strong>{formatEUR(json?.quote?.shippingCost)}</strong>
              </li>
              {typeof json?.quote?.codFee === 'number' && (
                <li>
                  Αντικαταβολή:{' '}
                  <strong>{formatEUR(json?.quote?.codFee)}</strong>
                </li>
              )}
              <li>
                Σύνολο: <strong>{formatEUR(json?.total)}</strong>
              </li>
            </ul>
          )}
        </div>
      </Card>
    </main>
  );
}
