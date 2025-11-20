import AddToCartButton from '@/components/AddToCartButton'
export const revalidate = 30

async function getData() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://dixis.io'
  const res = await fetch(`${base}/api/products`, { cache: 'no-store' })
  if (!res.ok) return { source:'unknown', count:0, items:[] }
  return res.json()
}

export default async function Page() {
  const { source, count, items } = await getData()
  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Προϊόντα</h1>
      <p className="text-sm text-neutral-600 mb-4">
        Πηγή: <span className="font-medium">{source}</span> • {count} αντικείμενα
      </p>
      {(!items || items.length === 0) ? (
        <div className="text-sm text-neutral-600">Δεν υπάρχουν διαθέσιμα προϊόντα.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((p: any) => (
            <div key={p.id} className="border rounded-lg overflow-hidden bg-white">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <span className="text-xs px-2 text-center">image: {p.image || '/demo/placeholder.jpg'}</span>
              </div>
              <div className="p-4 space-y-2">
                <div className="text-base font-medium line-clamp-2">{p.title}</div>
                <div className="flex items-center justify-between">
                  <div className="font-semibold">
                    {typeof p.priceCents === 'number' ? (p.priceCents/100).toFixed(2)+'€' : (p.price || '—')}
                  </div>
                  <AddToCartButton id={p.id} title={p.title} priceCents={p.priceCents} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
