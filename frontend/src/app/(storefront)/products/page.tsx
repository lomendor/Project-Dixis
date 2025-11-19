import { getTranslations } from 'next-intl/server'
import ProductsDiagOverlay from '@/components/products/ProductsDiagOverlay'

// AG116.7: ISR with 60s revalidation
export const revalidate = 60;

// AG116.9: Force static generation (no dynamic behavior)
export const dynamic = 'force-static';

async function getProducts(){
  try{
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3000'
    const res = await fetch(`${base}/api/public/products?per_page=20`, { next:{ revalidate: 300 }})
    if(!res.ok) return []
    const j = await res.json()
    return Array.isArray(j.data) ? j.data : (Array.isArray(j.items) ? j.items : (j.items?.data || []))
  }catch{ return [] }
}

export default async function ProductsPage(){
  const t = await getTranslations()
  const items = await getProducts()
  return (
    <>
      <main className="container mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">{t('products.title')}</h1>
        {items.length === 0 ? (
          <p>{t('products.empty')}</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-3">
            {items.map((p:any)=>(
              <li key={p.id} className="border rounded p-4">
                <div className="font-medium">{p.title || p.name}</div>
                {p.price ? <div>{Number(p.price).toFixed(2)} €</div> : null}
              </li>
            ))}
          </ul>
        )}
      </main>
      <ProductsDiagOverlay />
    </>
  )
}
