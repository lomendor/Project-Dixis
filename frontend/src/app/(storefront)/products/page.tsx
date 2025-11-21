import React from 'react'
import { getProducts } from '../../../lib/products'
import { ProductCard } from '@/components/ProductCard'

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
            {items.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                title={p.title}
                producer={p.producer}
                priceCents={p.priceCents ?? 0}
                image={p.imageUrl}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
