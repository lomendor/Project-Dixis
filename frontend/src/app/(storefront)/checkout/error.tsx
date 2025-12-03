'use client';

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main style={{ padding: 24, textAlign: 'center' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>
        Σφάλμα στο Checkout
      </h1>
      <p style={{ color: '#666', marginBottom: 16 }}>
        Παρουσιάστηκε πρόβλημα κατά την ολοκλήρωση της παραγγελίας σας.
      </p>
      <button
        onClick={reset}
        style={{
          padding: '8px 16px',
          background: '#10b981',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        Δοκιμάστε ξανά
      </button>
    </main>
  );
}
