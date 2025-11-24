'use client'
import React from 'react'
import Link from 'next/link'
import { useCart, cartCount, cartTotalCents } from '@/lib/cart'

export default function CartPage() {
  const items = useCart(s => s.items)
  const inc = useCart(s => s.inc)
  const dec = useCart(s => s.dec)
  const clear = useCart(s => s.clear)

  const count = cartCount(items)
  const totalCents = cartTotalCents(items)
  const fmt = new Intl.NumberFormat('el-GR', { style:'currency', currency:'EUR' })

  const list = Object.values(items)

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Καλάθι</h1>

        {list.length === 0 ? (
          <div className="bg-white border rounded-xl p-10 text-center">
            <p className="text-gray-600 mb-4">Το καλάθι σας είναι άδειο.</p>
            <Link href="/products" className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
              Συνέχεια αγορών
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border rounded-xl divide-y">
              {list.map((it) => (
                <div key={it.id} className="p-4 flex gap-4 items-start justify-between overflow-visible">
                  <div className="flex gap-4 items-center flex-1 min-w-0">
                    <div className="w-20 h-20 bg-gray-100 overflow-hidden rounded shrink-0">
                      {it.imageUrl ? (
                        <img src={it.imageUrl} alt={it.title} className="w-full h-full object-cover"/>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold leading-tight line-clamp-2">{it.title}</div>
                      <div className="text-sm text-gray-500">{fmt.format(it.priceCents / 100)}</div>
                      <div className="mt-2 flex items-center gap-3 flex-wrap">
                        <button type="button" onClick={() => dec(it.id)} className="h-8 w-8 rounded border hover:bg-gray-50 flex items-center justify-center" data-testid="qty-minus">−</button>
                        <span className="min-w-8 text-center" data-testid="qty">{it.qty}</span>
                        <button type="button" onClick={() => inc(it.id)} className="h-8 w-8 rounded border hover:bg-gray-50 flex items-center justify-center" data-testid="qty-plus">+</button>
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
                <span className="text-gray-600">Υποσύνολο</span>
                <span className="text-lg font-bold" data-testid="total">Σύνολο: {fmt.format(totalCents / 100)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Οι τελικές χρεώσεις (μεταφορικά/ΦΠΑ) υπολογίζονται στο checkout.</p>
              <button onClick={clear} className="mt-2 w-full inline-flex justify-center border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50">
                Καθαρισμός
              </button>
              <Link href="/checkout" className="mt-4 w-full inline-flex justify-center bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
                Συνέχεια στο checkout
              </Link>
              <Link href="/products" className="mt-2 w-full inline-flex justify-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
                Συνέχεια αγορών
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}
