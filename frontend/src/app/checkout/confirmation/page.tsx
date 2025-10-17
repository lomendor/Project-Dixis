'use client';
import React from 'react';
import { Card, CardTitle } from '../../../components/ui/card';
import { formatEUR } from '../../../lib/money';

export default function Confirmation() {
  const [json, setJson] = React.useState<any>(null);
  const [orderId, setOrderId] = React.useState<string>('');
  const [orderNo, setOrderNo] = React.useState<string>('');
  const [copied, setCopied] = React.useState<boolean>(false);

  React.useEffect(() => {
    try {
      setJson(
        JSON.parse(localStorage.getItem('checkout_last_summary') || 'null')
      );
    } catch {}
    try {
      setOrderId(localStorage.getItem('checkout_order_id') || '');
    } catch {}
    try {
      setOrderNo(localStorage.getItem('checkout_order_no') || '');
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
        {orderNo && (
          <div className="mt-1 text-sm text-neutral-800">
            Order No: <strong data-testid="order-no">{orderNo}</strong>
          </div>
        )}
        {orderId && (
          <div className="mt-1 text-xs text-neutral-600">
            Order ID: <strong data-testid="order-id">{orderId}</strong>
          </div>
        )}
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
        {orderNo && (
          <div className="mt-4 p-3 border rounded bg-gray-50">
            <div className="text-sm font-medium text-neutral-800 mb-2">
              Customer Link
            </div>
            <div className="text-xs text-neutral-600 break-all mb-2">
              <a
                href={`/orders/lookup?ordNo=${orderNo}`}
                className="underline"
                data-testid="customer-link"
              >
                {typeof window !== 'undefined'
                  ? `${window.location.origin}/orders/lookup?ordNo=${orderNo}`
                  : `/orders/lookup?ordNo=${orderNo}`}
              </a>
            </div>
            <button
              onClick={async () => {
                try {
                  const link =
                    typeof window !== 'undefined'
                      ? `${window.location.origin}/orders/lookup?ordNo=${orderNo}`
                      : `/orders/lookup?ordNo=${orderNo}`;
                  await navigator.clipboard.writeText(link);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch {}
              }}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              data-testid="copy-customer-link"
            >
              Copy link
            </button>
            {copied && (
              <span
                className="ml-2 text-xs text-green-600"
                data-testid="copied-flag"
              >
                Copied!
              </span>
            )}
          </div>
        )}
      </Card>
    </main>
  );
}
