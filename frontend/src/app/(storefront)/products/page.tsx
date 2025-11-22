export const revalidate = 20

type ApiItem = {
  id: string | number
  title: string
  producerName?: string
  priceCents?: number
  priceFormatted?: string
  imageUrl?: string
}

async function getData(page = 1, pageSize = 12) {
  const base = process.env.NEXT_PUBLIC_APP_URL || ''
  const url = `${base}/api/products?page=${page}&pageSize=${pageSize}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return { items: [], total: 0, page, pageSize }
  return res.json() as Promise<{ items: ApiItem[]; total: number; page: number; pageSize: number }>
}

export default async function Page() {
  const { items, total } = await getData(1, 12)

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Προϊόντα</h1>
            <p className="mt-2 text-sm text-gray-600">Απευθείας από παραγωγούς.</p>
          </div>
          <div className="mt-4 md:mt-0">
            {!!total && <span className="text-sm text-gray-500 italic">{total} διαθέσιμα</span>}
          </div>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((p) => (
              <div
                key={p.id}
                className="group flex flex-col h-full bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.imageUrl || 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=800&fit=crop'}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-col flex-grow p-4">
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                      {p.producerName || 'Παραγωγός'}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mt-1 leading-tight">{p.title}</h3>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className="text-lg font-bold text-gray-900">{p.priceFormatted || '—'}</span>
                    <button
                      className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 active:bg-emerald-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                      aria-label={`Προσθήκη ${p.title} στο καλάθι`}
                    >
                      Προσθήκη
                    </button>
                  </div>
                </div>
              </div>
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
