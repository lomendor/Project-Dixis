import React from 'react'
import { getProducts } from '../../../lib/products'

export const revalidate = 30

export default async function ProductsPage() {
  const items = await getProducts()

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Προϊόντα</h1>
        <p className="text-sm text-neutral-600 mb-8">Λίστα από API ή demo/mocks (fallback).</p>

        {(!items || items.length === 0) ? (
          <div className="text-neutral-600">Δεν υπάρχουν διαθέσιμα προϊόντα.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((p: any) => (
              <div key={p.id} className="border rounded-xl bg-white overflow-hidden">
                <div className="aspect-square bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                  εικόνα
                </div>
                <div className="p-4 space-y-2">
                  <div className="text-base font-semibold line-clamp-2">{p.title}</div>
                  <div className="text-xs text-neutral-600">{p.producer || p.producer_name || 'Παραγωγός'}</div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="font-semibold">{p.priceFormatted || p.price_text || '—'}</div>
                    <button className="h-9 px-3 rounded bg-neutral-900 text-white text-sm">Προσθήκη</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
