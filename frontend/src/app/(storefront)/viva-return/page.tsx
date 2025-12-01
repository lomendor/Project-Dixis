'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function VivaReturnContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function verifyPayment() {
      const orderCode = searchParams.get('s')
      const transactionId = searchParams.get('t')

      if (!orderCode) {
        setStatus('error')
        setMessage('Δεν βρέθηκαν στοιχεία πληρωμής')
        return
      }

      try {
        const res = await fetch(`/api/viva-verify?orderCode=${orderCode}&t=${transactionId || ''}`)
        const data = await res.json()

        if (res.ok && data.success) {
          setStatus('success')
          setMessage('Η πληρωμή ολοκληρώθηκε!')
          // Redirect to thank-you after brief delay
          setTimeout(() => {
            router.push(`/thank-you?id=${data.orderId}`)
          }, 1500)
        } else {
          setStatus('error')
          setMessage(data.error || 'Η πληρωμή απέτυχε ή ακυρώθηκε')
        }
      } catch {
        setStatus('error')
        setMessage('Σφάλμα επαλήθευσης πληρωμής')
      }
    }

    verifyPayment()
  }, [searchParams, router])

  return (
    <div className="max-w-md mx-auto bg-white border rounded-xl p-8 text-center">
      {status === 'loading' && (
        <>
          <div className="animate-spin w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Επαλήθευση πληρωμής...</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-emerald-600 mb-2">{message}</h1>
          <p className="text-gray-600">Ανακατεύθυνση...</p>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">{message}</h1>
          <div className="flex gap-3 justify-center">
            <a
              href="/checkout"
              className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 font-medium"
            >
              Δοκιμάστε ξανά
            </a>
            <a
              href="/products"
              className="inline-block border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50"
            >
              Προϊόντα
            </a>
          </div>
        </>
      )}
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="max-w-md mx-auto bg-white border rounded-xl p-8 text-center">
      <div className="animate-spin w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4" />
      <p className="text-gray-600">Φόρτωση...</p>
    </div>
  )
}

export default function VivaReturnPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <Suspense fallback={<LoadingFallback />}>
        <VivaReturnContent />
      </Suspense>
    </main>
  )
}
