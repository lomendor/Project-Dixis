import { ProductCard } from '@/components/ProductCard'
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
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">Δεν υπάρχουν διαθέσιμα προϊόντα αυτή τη στιγμή.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((p: any) => (
            <ProductCard
              key={p.id}
              id={p.id}
              title={p.title}
              producer={p.producer}
              priceCents={p.priceCents}
              image={p.image}
            />
          ))}
        </div>
      )}
    </main>
  )
}
