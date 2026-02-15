'use client';

import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container mx-auto px-4 py-16 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-neutral-900">Κάτι πήγε στραβά</h1>

      <p className="text-neutral-600 mt-2 max-w-md">
        Προέκυψε ένα απρόσμενο σφάλμα. Δοκιμάστε ξανά ή επιστρέψτε στην αρχική.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center bg-primary hover:bg-primary-light text-white font-medium py-3 px-6 rounded-lg transition"
        >
          Δοκιμάστε ξανά
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-medium py-3 px-6 rounded-lg transition"
        >
          Αρχική σελίδα
        </Link>
      </div>
    </main>
  );
}
