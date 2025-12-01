'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VivaReturnPage() {
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
        setMessage('”µ½ ²Á­¸·º±½ ÃÄ¿¹Çµ¯± À»·ÁÉ¼®Â')
        return
      }

      try {
        const res = await fetch(`/api/viva-verify?orderCode=${orderCode}&t=${transactionId || ''}`)
        const data = await res.json()

        if (res.ok && data.success) {
          setStatus('success')
          setMessage('— À»·ÁÉ¼® ¿»¿º»·ÁÎ¸·ºµ!')
          // Redirect to thank-you after brief delay
          setTimeout(() => {
            router.push(`/thank-you?id=${data.orderId}`)
          }, 1500)
        } else {
          setStatus('error')
          setMessage(data.error || '— À»·ÁÉ¼® ±À­ÄÅÇµ ® ±ºÅÁÎ¸·ºµ')
        }
      } catch {
        setStatus('error')
        setMessage('£Æ¬»¼± µÀ±»®¸µÅÃ·Â À»·ÁÉ¼®Â')
      }
    }

    verifyPayment()
  }, [searchParams, router])

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white border rounded-xl p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">•À±»®¸µÅÃ· À»·ÁÉ¼®Â...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-5xl mb-4"></div>
            <h1 className="text-2xl font-bold text-emerald-600 mb-2">{message}</h1>
            <p className="text-gray-600">‘½±º±ÄµÍ¸Å½Ã·...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-5xl mb-4"></div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">{message}</h1>
            <div className="flex gap-3 justify-center">
              <a
                href="/checkout"
                className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 font-medium"
              >
                ”¿º¹¼¬ÃÄµ ¾±½¬
              </a>
              <a
                href="/products"
                className="inline-block border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50"
              >
                 Á¿ÊÌ½Ä±
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
