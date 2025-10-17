'use client';
import React from 'react';
import { Card, CardTitle } from '../../../components/ui/card';
import { formatEUR } from '../../../lib/money';

export default function PaymentPage() {
  const [json, setJson] = React.useState<any>(null);
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<string>('');

  React.useEffect(() => {
    try {
      setJson(
        JSON.parse(localStorage.getItem('checkout_last_summary') || 'null')
      );
    } catch {}
  }, []);

  async function pay() {
    if (!json) return;
    setBusy(true);
    setMsg('');
    const { createSession, confirmPayment } = await import(
      '../../../lib/payments/mockProvider'
    );
    const session = await createSession(json.total ?? 0);
    const res = await confirmPayment(session.id);
    setBusy(false);
    if (res.ok) {
      // Save order to database/memory before redirect
      try {
        const resp = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            summary: { ...json, paymentSessionId: session.id },
          }),
        });
        const created = await resp.json().catch((): null => null);
        if (created && created.id) {
          try {
            localStorage.setItem('checkout_order_id', String(created.id));
          } catch {}
          if (created.orderNumber) {
            try {
              localStorage.setItem(
                'checkout_order_no',
                String(created.orderNumber)
              );
            } catch {}
          }
        }
      } catch {
        // Continue even if order save fails
      }
      window.location.href = '/checkout/confirmation';
    } else {
      setMsg('Η πληρωμή απέτυχε. Δοκίμασε ξανά.');
    }
  }

  return (
    <main style={{ maxWidth: 760, margin: '40px auto', padding: 16 }}>
      <h2 style={{ margin: 0 }}>Πληρωμή</h2>
      <p style={{ color: '#6b7280', marginTop: 6 }}>
        Mock adapter για δοκιμή ροής.
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
                Σύνολο:{' '}
                <strong data-testid="pay-total">{formatEUR(json?.total)}</strong>
              </li>
            </ul>
          )}
        </div>
        <div className="mt-3">
          <button
            data-testid="pay-now"
            onClick={pay}
            disabled={!json || busy}
            className="inline-flex items-center justify-center rounded-md bg-primary px-3 h-9 text-primary-foreground"
          >
            {busy ? 'Γίνεται πληρωμή…' : 'Pay now'}
          </button>
          {msg && <div className="mt-2 text-sm text-red-600">{msg}</div>}
        </div>
      </Card>
    </main>
  );
}
