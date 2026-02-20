'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart, cartTotalCents, isMultiProducerCart } from '@/lib/cart'

export default function CartPage() {
  const router = useRouter()
  const items = useCart(s => s.items)
  const inc = useCart(s => s.inc)
  const dec = useCart(s => s.dec)
  const clear = useCart(s => s.clear)

  const totalCents = cartTotalCents(items)
  const fmt = new Intl.NumberFormat('el-GR', { style:'currency', currency:'EUR' })

  const list = Object.values(items)

  const handleCheckout = () => {
    // Pass 52 fix: Navigate to /checkout page where user can:
    // 1. Fill shipping details
    // 2. Select payment method (COD or Card)
    // 3. Submit order with all required fields
    //
    // Previously this function created the order directly from cart,
    // bypassing the checkout page entirely and never showing payment options.
    router.push('/checkout')
  }

  return (
    <main className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Καλάθι</h1>

        {list.length === 0 ? (
          <div className="bg-white border rounded-xl p-10 sm:p-14 text-center" data-testid="empty-cart">
            {/* Cart icon */}
            <div className="mx-auto w-20 h-20 rounded-full bg-accent-cream flex items-center justify-center mb-5">
              <svg className="w-10 h-10 text-accent-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mb-1" data-testid="empty-cart-message">Το καλάθι σας είναι άδειο</h2>
            <p className="text-sm text-neutral-500 mb-6">Ανακαλύψτε τα αυθεντικά ελληνικά προϊόντα μας!</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-light transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Ανακαλύψτε Προϊόντα
            </Link>
          </div>
        ) : (
          <>
          {/* T2.5-06: Multi-producer notice — early warning before checkout */}
          {isMultiProducerCart(items) && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm mb-4" data-testid="multi-producer-notice">
              <svg className="w-4 h-4 mt-0.5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-amber-800">
                Το καλάθι σας περιέχει προϊόντα από διαφορετικούς παραγωγούς. Θα λάβετε <strong>ξεχωριστά δέματα</strong> για κάθε παραγωγό.
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border rounded-xl divide-y">
              {list.map((it) => (
                <div key={it.id} className="p-4 flex gap-4 items-start justify-between overflow-visible">
                  <div className="flex gap-4 items-center flex-1 min-w-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-100 overflow-hidden rounded shrink-0">
                      {it.imageUrl ? (
                        <Image src={it.imageUrl} alt={it.title} width={80} height={80} className="w-full h-full object-cover"/>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold leading-tight line-clamp-2">{it.title}</div>
                      <div className="text-sm text-neutral-500">{fmt.format(it.priceCents / 100)}</div>
                      <div className="mt-2 flex items-center gap-3 flex-wrap">
                        <button type="button" onClick={() => dec(it.id)} className="h-11 w-11 rounded border hover:bg-neutral-50 flex items-center justify-center text-lg" data-testid="qty-minus">−</button>
                        <span className="min-w-8 text-center" data-testid="qty">{it.qty}</span>
                        <button type="button" onClick={() => inc(it.id)} className="h-11 w-11 rounded border hover:bg-neutral-50 flex items-center justify-center text-lg" data-testid="qty-plus">+</button>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right font-semibold text-lg whitespace-nowrap ml-4 mt-1" style={{fontVariantNumeric: 'tabular-nums'}}>
                    {fmt.format((it.priceCents * it.qty) / 100)}
                  </div>
                </div>
              ))}
            </div>

            <aside className="bg-white border rounded-xl p-6 h-fit">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Υποσύνολο</span>
                <span className="text-lg font-bold" data-testid="total">{fmt.format(totalCents / 100)}</span>
              </div>
              <p className="text-xs text-neutral-500 mt-2">Οι τελικές χρεώσεις (μεταφορικά/ΦΠΑ) υπολογίζονται κατά την ολοκλήρωση.</p>
              <button
                onClick={() => { if (window.confirm('Είστε σίγουροι ότι θέλετε να αδειάσετε το καλάθι;')) clear() }}
                className="mt-2 w-full inline-flex justify-center border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50"
                data-testid="clear-cart"
              >
                Καθαρισμός
              </button>
              <button
                onClick={handleCheckout}
                className="mt-4 w-full inline-flex justify-center bg-primary text-white px-4 py-3 rounded-lg font-medium hover:bg-primary-light focus:ring-2 focus:ring-primary/50 focus:outline-none active:opacity-90 touch-manipulation"
                data-testid="go-checkout"
              >
                Ολοκλήρωση παραγγελίας
              </button>
              <Link href="/products" className="mt-2 w-full inline-flex justify-center border border-neutral-300 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-50">
                Συνέχεια αγορών
              </Link>
            </aside>
          </div>
          </>
        )}
      </div>
    </main>
  )
}
