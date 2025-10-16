'use client';
import React from 'react';
import { Card, CardTitle } from '../../../components/ui/card';
import { formatEUR } from '../../../lib/money';

export default function Confirmation() {
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
      <h2 style={{ margin: 0 }}>Επιβεβαίωση παραγγελίας</h2>
      <p style={{ color: '#6b7280', marginTop: 6 }}>
        Mock επιτυχία πληρωμής.
      </p>
      <Card>
        <CardTitle>Σύνοψη</CardTitle>
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
                Σύνολο:{' '}
                <strong data-testid="confirm-total">
                  {formatEUR(json?.total)}
                </strong>
              </li>
            </ul>
          )}
        </div>
      </Card>
    </main>
  );
}
