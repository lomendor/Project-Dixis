export const revalidate = 30

async function getData() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://dixis.io'
  const res = await fetch(`${base}/api/products`, { cache: 'no-store' })
  if (!res.ok) return { items: [] as any[] }
  return res.json()
}

export default async function Page() {
  const { items } = await getData()

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Προϊόντα</h1>
      <p className="text-sm text-neutral-600 mb-6">
        {process.env.PRODUCTS_DB_V1?.toLowerCase() === 'on'
          ? 'Προβολή από βάση δεδομένων (flag: ON).'
          : 'Προσωρινό feed ή κενό (flag: OFF).'}
      </p>

      {(!items || items.length === 0) ? (
        <div className="text-sm text-neutral-600">Δεν υπάρχουν διαθέσιμα προϊόντα.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((p: any) => (
            <div key={p.id} className="border rounded-lg overflow-hidden bg-white">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <span className="text-xs px-2 text-center">{p.image ? 'image' : 'no image'}</span>
              </div>
              <div className="p-4 space-y-2">
                <div className="text-base font-medium line-clamp-2">{p.title}</div>
                <div className="text-sm text-neutral-600">{p.producer || '—'}</div>
                <div className="font-semibold">{p.price || '—'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
