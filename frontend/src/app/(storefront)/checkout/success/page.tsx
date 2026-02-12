'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams?.get('orderId') || 'N/A'

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white border rounded-xl p-10 text-center" data-testid="success-page">
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-green-600 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-4">Επιτυχία!</h1>

        <p className="text-gray-600 mb-2">
          Η παραγγελία σας καταχωρήθηκε επιτυχώς.
        </p>

        <p className="text-sm text-gray-500 mb-6" data-testid="order-id">
          Κωδικός παραγγελίας: <span className="font-mono font-semibold">{orderId}</span>
        </p>

        <div className="space-y-3">
          <Link
            href="/products"
            className="inline-block w-full bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700"
          >
            Συνέχεια αγορών
          </Link>

          <Link
            href="/"
            className="inline-block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50"
          >
            Πίσω στην αρχική
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Φόρτωση…</div>}>
      <SuccessContent />
    </Suspense>
  )
}
