'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

type OrderResult = {
  orderNo: string;
  createdAt: string;
  postalCode: string;
  method: string;
  total: number;
  paymentStatus?: string;
};

const ORD_RE = /^DX-\d{8}-[A-Z0-9]{4}$/i;
function isValidOrdNo(s: string) {
  return ORD_RE.test((s || '').trim());
}
function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s || '').trim());
}

function OrderLookupContent() {
  const sp = useSearchParams();
  const [orderNo, setOrderNo] = React.useState('');
  const [email, setEmail] = React.useState('');
  const emailRef = React.useRef<HTMLInputElement | null>(null);

  const [errorMessage, setErrorMessage] = React.useState('');
  const [result, setResult] = React.useState<OrderResult | null>(null);
  const [busy, setBusy] = React.useState(false);

  const [errNo, setErrNo] = React.useState('');
  const [errEmail, setErrEmail] = React.useState('');

  // prefill from ?ordNo= & autofocus email (AG30) + load saved email (AG32)
  React.useEffect(() => {
    // AG32: localStorage email persistence
    const q = sp?.get('ordNo') || '';
    if (q && !orderNo) setOrderNo(q);

    // Load saved email from localStorage (AG32)
    try {
      const saved = localStorage.getItem('dixis.lastEmail') || '';
      if (saved && !email) setEmail(saved);
    } catch {}

    try {
      emailRef.current?.focus();
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  function validate(): boolean {
    let ok = true;
    const eNo = isValidOrdNo(orderNo)
      ? ''
      : 'Παρακαλώ δώστε μορφή DX-YYYYMMDD-XXXX.';
    const eEmail = isValidEmail(email) ? '' : 'Μη έγκυρο email.';
    setErrNo(eNo);
    setErrEmail(eEmail);
    if (eNo || eEmail) ok = false;
    return ok;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');
    setResult(null);
    if (!validate()) return;

    setBusy(true);
    try {
      const r = await fetch('/api/order-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNo, email }),
      });

      if (r.ok) {
        const data = await r.json();
        setResult(data);
        // Save email on successful lookup (AG32)
        try {
          localStorage.setItem('dixis.lastEmail', email);
        } catch {}
      } else if (r.status === 404) {
        setErrorMessage('Δεν βρέθηκε παραγγελία με αυτά τα στοιχεία.');
      } else if (r.status === 429) {
        setErrorMessage('Πολλές προσπάθειες. Δοκιμάστε ξανά σε λίγο.');
      } else {
        setErrorMessage('Σφάλμα αναζήτησης. Προσπαθήστε ξανά.');
      }
    } catch {
      setErrorMessage('Πρόβλημα σύνδεσης.');
    } finally {
      setBusy(false);
    }
  }

  const disableAll = busy;

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: 16 }}>
      <h2 style={{ margin: 0 }}>Εύρεση Παραγγελίας</h2>
      <p style={{ color: '#6b7280', marginTop: 6 }}>
        Βάλτε τον αριθμό παραγγελίας (π.χ. <code>DX-20251017-AB12</code>) και το
        email σας.
      </p>

      <form onSubmit={onSubmit} className="mt-4" aria-busy={busy}>
        <div className="flex flex-col gap-3">
          <div>
            <input
              value={orderNo}
              onChange={(e) => {
                setOrderNo(e.target.value);
                if (errNo) setErrNo('');
              }}
              placeholder="Order No (DX-YYYYMMDD-####)"
              className="border px-3 py-2 rounded w-full"
              aria-invalid={!!errNo}
              disabled={disableAll}
              data-testid="lookup-order-no"
            />
            {errNo && (
              <div data-testid="error-ordno" className="text-xs text-red-600 mt-1">
                {errNo}
              </div>
            )}
          </div>

          <div>
            <input
              value={email}
              onChange={(e) => {
                const val = e.target.value;
                setEmail(val);
                if (errEmail) setErrEmail('');
                // Save valid emails to localStorage immediately (AG32)
                if (isValidEmail(val)) {
                  try {
                    localStorage.setItem('dixis.lastEmail', val);
                  } catch {}
                }
              }}
              placeholder="Email"
              ref={emailRef}
              type="email"
              className="border px-3 py-2 rounded w-full"
              aria-invalid={!!errEmail}
              disabled={disableAll}
              data-testid="lookup-email"
            />
            {errEmail && (
              <div data-testid="error-email" className="text-xs text-red-600 mt-1">
                {errEmail}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={disableAll}
              className="border px-3 py-2 rounded disabled:bg-gray-200 disabled:cursor-not-allowed"
              data-testid="lookup-submit"
            >
              {busy ? 'Αναζήτηση…' : 'Αναζήτηση'}
            </button>
            {busy && (
              <span data-testid="lookup-busy" className="text-xs text-neutral-600">
                Αναζήτηση…
              </span>
            )}
          </div>
        </div>
      </form>

      {errorMessage && (
        <div className="mt-3 text-sm text-red-600" role="alert" data-testid="lookup-error">
          {errorMessage}
        </div>
      )}

      {result && (
        <div className="mt-5 text-sm border rounded p-3" data-testid="lookup-result">
          <div>
            <strong>Order No:</strong>{' '}
            <span data-testid="result-order-no">{result.orderNo}</span>
          </div>
          <div>
            <strong>Ημ/νία:</strong>{' '}
            {new Date(result.createdAt).toLocaleString('el-GR')}
          </div>
          <div>
            <strong>Τ.Κ.:</strong> {result.postalCode}
          </div>
          <div>
            <strong>Μέθοδος:</strong> {result.method}
          </div>
          <div>
            <strong>Σύνολο:</strong> €{Number(result.total).toFixed(2)}
          </div>
          <div>
            <strong>Status:</strong> {result.paymentStatus ?? 'PAID'}
          </div>
        </div>
      )}
    </main>
  );
}

export default function OrderLookupPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto p-6">Loading...</div>}>
      <OrderLookupContent />
    </Suspense>
  );
}
