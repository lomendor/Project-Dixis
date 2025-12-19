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
  // Fetch from backend API (source of truth)
  // Server-side: use localhost to avoid Monarx blocking and reduce latency
  // Client-side: use public URL
  const base = typeof window === 'undefined'
    ? 'http://127.0.0.1:8001/api/v1'
    : (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://dixis.gr/api/v1')
  try {
    const res = await fetch(`${base}/public/products`, { cache: 'no-store' })
    if (!res.ok) return { items: [], total: 0 }
    const json = await res.json()
    const products = json?.data ?? []

    // Map backend format to frontend format
    const items = products.map((p: any) => ({
      id: p.id,
      title: p.name,
      producerName: p.producer?.name || null,
      priceCents: Math.round(parseFloat(p.price) * 100),
      imageUrl: p.image_url
    }))

    return { items, total: items.length }
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Προϊόντα</h1>
            <p className="mt-2 text-sm text-gray-600">Απευθείας από παραγωγούς — {total} συνολικά.</p>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
