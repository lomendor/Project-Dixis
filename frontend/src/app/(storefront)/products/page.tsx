import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { apiUrl } from '@/lib/http/apiBase'

async function getProducts() {
  try {
    const url = apiUrl('/api/public/products?per_page=20')
    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const j = await res.json()
    return j.items || j.data || []
  } catch {
    return []
  }
}

export default async function ProductsPage() {
  const t = await getTranslations()
  const items = await getProducts()

  return (
    <main className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">
        {t('products.title')}
      </h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((p: any) => (
          <div
            key={p.id || p.slug || p.title}
            className="border rounded p-3 hover:shadow-sm transition"
          >
            <div className="font-medium">{p.title || '—'}</div>
            <div className="text-sm opacity-75">{p.category || '—'}</div>
            <div className="mt-1">
              {typeof p.price === 'number'
                ? new Intl.NumberFormat('el-GR', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(p.price)
                : '—'}
            </div>
          </div>
        ))}
        
        {items.length === 0 && (
          <div className="col-span-full opacity-70">
            {t('products.empty')}
          </div>
        )}
      </div>

      <div className="mt-6 text-sm opacity-75">
        {t('products.note')}
      </div>
      
      <div className="mt-4">
        <Link href="/" className="text-blue-600 hover:underline">
          {t('nav.home')}
        </Link>
      </div>
    </main>
  )
}
