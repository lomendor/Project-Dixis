import type { Metadata } from 'next'

// AG116.13: Correct canonical URL for /products
export const metadata: Metadata = {
  title: 'Προϊόντα | Dixis',
  alternates: {
    canonical: 'https://dixis.io/products',
  },
}

// AG116.15: Reduced revalidation for demo feed
export const revalidate = 30

async function getData() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://dixis.io'
  try {
    const res = await fetch(`${base}/api/products`, { cache: 'no-store' })
    if (!res.ok) return { source: 'demo', items: [] }
    return res.json()
  } catch {
    return { source: 'demo', items: [] }
  }
}

export default async function Page() {
  const { source, items }: { source?: 'db' | 'demo'; items: any[] } = await getData()

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Προϊόντα</h1>
      <p className="text-sm text-neutral-600 mb-6">
        {source === 'db' ? 'Δεδομένα από Neon DB' : 'Προσωρινή λίστα από demo feed'}
      </p>

      {(!items || items.length === 0) ? (
        <div className="text-sm text-neutral-600">Δεν υπάρχουν διαθέσιμα προϊόντα.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((p: any) => (
            <div key={p.id} className="border rounded-lg overflow-hidden bg-white">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <span className="text-xs px-2 text-center">image: {p.image || p.img || '/demo/placeholder.jpg'}</span>
              </div>
              <div className="p-4 space-y-2">
                <div className="text-base font-medium line-clamp-2">{p.title}</div>
                <div className="text-sm text-neutral-600">{p.producer || p.producer_name || 'Παραγωγός'}</div>
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{p.price || p.price_text || p.priceCents ? `€${(p.priceCents/100).toFixed(2)}` : '—'}</div>
                  <button className="h-9 px-3 rounded bg-neutral-900 text-white text-sm">Προσθήκη</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
