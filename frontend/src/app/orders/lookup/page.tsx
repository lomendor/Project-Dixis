'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
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
  const [clearMsg, setClearMsg] = React.useState(''); // AG34: clear success flag
  const [copyMsg, setCopyMsg] = React.useState(''); // AG40: copy toast message

  const [errNo, setErrNo] = React.useState('');
  const [errEmail, setErrEmail] = React.useState('');
  const [fromStorage, setFromStorage] = React.useState(false); // AG35: track if email came from localStorage

  // prefill from ?ordNo= & autofocus email (AG30) + load saved email (AG32)
  React.useEffect(() => {
    const q = sp?.get('ordNo') || '';
    if (q && !orderNo) setOrderNo(q);

    // Load saved email from localStorage (AG32)
    try {
      const saved = localStorage.getItem('dixis.lastEmail') || '';
      if (saved && !email) {
        setEmail(saved);
        setFromStorage(true); // AG35: mark that email came from storage
      }
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

  // AG34: Clear remembered email from localStorage
  function onClear() {
    try {
      localStorage.removeItem('dixis.lastEmail');
    } catch {}
    setEmail('');
    setFromStorage(false); // AG35: hide hint when clearing
    setClearMsg('Καθαρίστηκε');
    setTimeout(() => setClearMsg(''), 1200);
  }

  // AG40: Copy current order link handler
  async function onCopyCurrent() {
    try {
      const ord = result?.orderNo;
      if (!ord) return;
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const url = origin ? `${origin}/orders/lookup?ordNo=${encodeURIComponent(ord)}` : '';
      if (!url) return;
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      setCopyMsg('Αντιγράφηκε');
      setTimeout(() => setCopyMsg(''), 1200);
    } catch {}
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
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold text-neutral-900">Εύρεση Παραγγελίας</h2>
      <p className="text-neutral-500 mt-1.5">
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
              placeholder="Αρ. παραγγελίας (DX-YYYYMMDD-####)"
              className="border border-neutral-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                setFromStorage(false); // AG35: hide hint when user types
                if (errEmail) setErrEmail('');
                // Save valid emails to localStorage immediately (AG32)
                if (isValidEmail(val)) {
                  try {
                    localStorage.setItem('dixis.lastEmail', val);
                  } catch {}
                }
              }}
              placeholder="Διεύθυνση email"
              ref={emailRef}
              type="email"
              className="border border-neutral-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              aria-invalid={!!errEmail}
              disabled={disableAll}
              data-testid="lookup-email"
            />
            {errEmail && (
              <div data-testid="error-email" className="text-xs text-red-600 mt-1">
                {errEmail}
              </div>
            )}
            {fromStorage && !busy && (
              <div data-testid="saved-email-hint" className="text-xs text-neutral-600 mt-1">
                Χρησιμοποιείται αποθηκευμένο email ·{' '}
                <button
                  type="button"
                  data-testid="saved-email-clear"
                  onClick={onClear}
                  className="underline hover:text-neutral-800"
                >
                  Καθαρισμός
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={disableAll}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="lookup-submit"
            >
              {busy ? 'Αναζήτηση…' : 'Αναζήτηση'}
            </button>
            <button
              type="button"
              onClick={onClear}
              disabled={disableAll}
              className="border border-neutral-300 px-4 py-2 rounded-lg text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="clear-remembered-email"
            >
              Καθαρισμός email
            </button>
            {busy && (
              <span data-testid="lookup-busy" className="text-xs text-neutral-600">
                Αναζήτηση…
              </span>
            )}
            {clearMsg && (
              <span data-testid="clear-flag" className="text-green-700 text-xs">
                {clearMsg}
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
        <div className="mt-5 text-sm border border-neutral-200 rounded-lg p-4 bg-neutral-50" data-testid="lookup-result">
          {/* AG40: Copy order link button */}
          <div className="mb-3 flex items-center gap-3">
            <button
              type="button"
              data-testid="copy-order-link-lookup"
              onClick={onCopyCurrent}
              className="border border-neutral-300 px-3 py-1.5 rounded-lg text-sm hover:bg-neutral-100 transition-colors"
            >
              Αντιγραφή συνδέσμου
            </button>
            {copyMsg && (
              <span data-testid="copy-toast-lookup" className="text-xs text-green-700">
                {copyMsg}
              </span>
            )}
          </div>
          <div>
            <strong>Αρ. Παραγγελίας:</strong>{' '}
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
            <strong>Κατάσταση:</strong> {result.paymentStatus ?? 'PAID'}
          </div>
        </div>
      )}

      {/* AG38: Back to shop link */}
      <div className="mt-6">
        <Link href="/" data-testid="back-to-shop-link" className="text-emerald-600 hover:text-emerald-800 text-sm">
          ← Πίσω στο κατάστημα
        </Link>
      </div>
    </main>
  );
}

export default function OrderLookupPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto p-6 text-neutral-500">Φόρτωση…</div>}>
      <OrderLookupContent />
    </Suspense>
  );
}
