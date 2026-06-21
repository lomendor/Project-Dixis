'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type FormState = 'idle' | 'sending' | 'ok' | 'error';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') ?? '';
  const [state, setState] = useState<FormState>('idle');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState('sending');
    const fd = new FormData(e.currentTarget);
    const payload = { email: fd.get('email') as string };

    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setState(res.ok ? 'ok' : 'error');
    } catch {
      setState('error');
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-neutral-900">Διαγραφή από τη Λίστα</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Δεν θέλετε να λαμβάνετε ενημερωτικά email; Συμπληρώστε τη φόρμα.
          </p>
        </div>

        {state === 'ok' && (
          <div className="mb-6 p-4 rounded-lg bg-primary-pale border border-primary/20 text-primary text-sm text-center">
            <span className="font-medium">Η διαγραφή σας καταχωρήθηκε.</span>
            <p className="mt-1 text-neutral-600">Δεν θα λαμβάνετε πλέον ενημερωτικά email.</p>
          </div>
        )}

        {state === 'error' && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm text-center">
            Κάτι πήγε στραβά. Δοκιμάστε ξανά ή στείλτε email στο info@dixis.gr.
          </div>
        )}

        {state !== 'ok' && (
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sm:p-8">
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label htmlFor="unsub-email" className="block text-sm font-medium text-neutral-700 mb-1">
                  Email
                </label>
                <input
                  id="unsub-email"
                  name="email"
                  type="email"
                  required
                  defaultValue={emailParam}
                  placeholder="you@example.com"
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={state === 'sending'}
                className="w-full px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-neutral-700 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 disabled:opacity-50 transition-colors"
              >
                {state === 'sending' ? 'Επεξεργασία...' : 'Διαγραφή'}
              </button>
            </form>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-neutral-500">
          Σημείωση: Τα email παραγγελιών (επιβεβαίωση, αποστολή, παράδοση) δεν επηρεάζονται.{' '}
          <Link href="/contact" className="text-primary hover:underline">Επικοινωνία</Link>
        </p>
      </div>
    </main>
  );
}
