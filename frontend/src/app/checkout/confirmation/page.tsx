'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const router = useRouter();

  if (!orderId) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Σφάλμα</h1>
        <p className="text-gray-600 mb-8">Δεν βρέθηκε παραγγελία</p>
        <button
          onClick={() => router.push('/')}
          className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Επιστροφή στην Αρχική
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Η παραγγελία σας ολοκληρώθηκε!
        </h1>
        <p className="text-gray-600">Σας ευχαριστούμε για την εμπιστοσύνη σας</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8 inline-block">
        <p className="text-sm text-gray-600 mb-2">Αριθμός Παραγγελίας</p>
        <p className="text-2xl font-bold text-gray-900 font-mono">{orderId}</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 max-w-md mx-auto">
        <p className="text-sm text-blue-900">
          Θα λάβετε σύντομα email επιβεβαίωσης με τις λεπτομέρειες της παραγγελίας σας.
          Η πληρωμή θα γίνει με αντικαταβολή κατά την παράδοση.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/"
          className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Επιστροφή στην Αρχική
        </Link>
        <Link
          href="/products"
          className="inline-block border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition"
        >
          Συνέχεια Αγορών
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl w-full px-4 py-8">
        <Suspense fallback={<div className="text-center">Φόρτωση...</div>}>
          <ConfirmationContent />
        </Suspense>
      </div>
    </div>
  );
}
