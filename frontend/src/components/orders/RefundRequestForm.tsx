'use client';

import { useState } from 'react';
import Link from 'next/link';

interface RefundRequestFormProps {
  orderId: number;
  orderTotal: string;
  paymentStatus: string;
}

type FormState = 'idle' | 'sending' | 'ok' | 'error';

export default function RefundRequestForm({ orderId, orderTotal, paymentStatus }: RefundRequestFormProps) {
  const [state, setState] = useState<FormState>('idle');
  const [expanded, setExpanded] = useState(false);

  // Only show for paid orders
  const isPaid = paymentStatus === 'completed' || paymentStatus === 'paid';
  if (!isPaid) return null;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState('sending');
    const fd = new FormData(e.currentTarget);
    const payload = {
      orderId,
      reason: fd.get('reason') as string,
      email: fd.get('email') as string,
      name: fd.get('name') as string || undefined,
      hp: fd.get('hp') as string || undefined,
    };

    try {
      const res = await fetch('/api/refund-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setState(res.ok ? 'ok' : 'error');
    } catch {
      setState('error');
    }
  };

  if (state === 'ok') {
    return (
      <div data-testid="refund-request-section" className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="p-6">
          <div className="p-4 rounded-lg bg-primary-pale border border-primary/20 text-primary text-sm">
            <span className="font-medium">Το αίτημά σας καταχωρήθηκε!</span>
            <p className="mt-1 text-neutral-600">
              Θα επικοινωνήσουμε μαζί σας εντός 2 εργάσιμων ημερών.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="refund-request-section" className="bg-white rounded-lg shadow-sm border border-neutral-200">
      <div className="p-6">
        {!expanded ? (
          <>
            <button
              onClick={() => setExpanded(true)}
              data-testid="refund-request-toggle"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border border-neutral-300 text-sm font-medium rounded-lg text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Αίτημα Επιστροφής
            </button>
            <p className="mt-2 text-xs text-neutral-500 text-center">
              <Link href="/legal/returns" className="hover:underline text-primary">
                Πολιτική Επιστροφών
              </Link>
            </p>
          </>
        ) : (
          <>
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">Αίτημα Επιστροφής — #{orderId}</h3>
            <p className="text-xs text-neutral-500 mb-4">
              Ποσό παραγγελίας: {orderTotal}. Δείτε την{' '}
              <Link href="/legal/returns" className="text-primary hover:underline">
                Πολιτική Επιστροφών
              </Link>.
            </p>

            {state === 'error' && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                Κάτι πήγε στραβά. Δοκιμάστε ξανά ή επικοινωνήστε στο info@dixis.gr.
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              {/* Honeypot */}
              <input type="text" name="hp" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

              <div>
                <label htmlFor="refund-reason" className="block text-sm font-medium text-neutral-700 mb-1">
                  Λόγος αιτήματος *
                </label>
                <textarea
                  id="refund-reason"
                  name="reason"
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={3}
                  placeholder="Περιγράψτε τον λόγο (π.χ. ελαττωματικό προϊόν, λάθος παραγγελία...)"
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                  data-testid="refund-reason"
                />
              </div>

              <div>
                <label htmlFor="refund-email" className="block text-sm font-medium text-neutral-700 mb-1">
                  Email επικοινωνίας *
                </label>
                <input
                  id="refund-email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  data-testid="refund-email"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={state === 'sending'}
                  data-testid="refund-submit"
                  className="flex-1 inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {state === 'sending' ? 'Αποστολή...' : 'Υποβολή Αιτήματος'}
                </button>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="px-4 py-2.5 border border-neutral-300 text-sm font-medium rounded-lg text-neutral-700 bg-white hover:bg-neutral-50 transition-colors"
                >
                  Ακύρωση
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
