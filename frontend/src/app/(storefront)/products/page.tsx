export const revalidate = 30

type ApiItem = {
  id: string | number
  title: string
  producerName?: string
  priceFormatted?: string
  imageUrl?: string
}

async function getData() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://dixis.io'
  try {
    const res = await fetch(`${base}/api/products`, { cache: 'no-store' })
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
              <div key={p.id} className="group flex flex-col h-full bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                  <img src={p.imageUrl || '/demo/placeholder.jpg'} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                </div>
                <div className="flex flex-col flex-grow p-4">
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">{p.producerName || 'Παραγωγός'}</span>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mt-1">{p.title}</h3>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className="text-lg font-bold text-gray-900">{p.priceFormatted || '—'}</span>
                    <button className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 focus:outline-none">
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
