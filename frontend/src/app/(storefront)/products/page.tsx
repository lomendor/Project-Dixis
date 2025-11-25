import { ProductCard } from '@/components/ProductCard'

export const revalidate = 30

type ApiItem = {
  id: string | number
  title: string
  producerName?: string
  priceCents: number
  priceFormatted?: string
  imageUrl?: string
}

async function getData() {
  // For local dev: use localhost:3001 (project standard port)
  // For CI/production: use NEXT_PUBLIC_BASE_URL env var
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:3001'
  try {
    const res = await fetch(`${base}/api/products?pageSize=12`, { cache: 'no-store' })
    if (!res.ok) return { items: [], total: 0 }
    return res.json()
  } catch {
    return { items: [], total: 0 }
  }
}

export default async function Page() {
  const { items = [], total = 0 } = await getData()

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Προϊόντα</h1>
            <p className="mt-2 text-sm text-gray-600">Απευθείας από παραγωγούς — {total} συνολικά.</p>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((p: ApiItem) => (
              <ProductCard
                key={p.id}
                id={p.id}
                title={p.title}
                producer={p.producerName || null}
                priceCents={p.priceCents}
                image={p.imageUrl}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">Δεν υπάρχουν διαθέσιμα προϊόντα αυτή τη στιγμή.</p>
          </div>
        )}
      </div>
    </main>
  )
}
