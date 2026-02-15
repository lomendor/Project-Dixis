'use client';

export default function MyAccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="p-6 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-2">
        Σφάλμα στον Λογαριασμό
      </h1>
      <p className="text-neutral-500 mb-4">
        Παρουσιάστηκε πρόβλημα κατά τη φόρτωση της σελίδας.
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
      >
        Δοκιμάστε ξανά
      </button>
    </main>
  );
}
