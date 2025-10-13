import Link from 'next/link'
import { fmtEUR } from '@/lib/cart/totals'

async function fetchProducts(searchParams: Record<string,string>) {
  const qs = new URLSearchParams(searchParams as any).toString()
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/products?`+qs, { cache:'no-store' })
  if (!res.ok) throw new Error('Αποτυχία φόρτωσης')
  return res.json() as Promise<{ ok:boolean, count:number, items:{ id:string, title:string, category:string, price:number, unit:string, stock:number }[] }>
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string,string>> }) {
  const params = await searchParams
  let data:{ ok:boolean, count:number, items:any[] } = { ok:false, count:0, items:[] }
  try { data = await fetchProducts(params) } catch {}

  const q = params.q || ''
  const category = params.category || 'all'
  const min = params.min || ''
  const max = params.max || ''

  return (
    <main className="mx-auto max-w-5xl p-4">
      <h1 className="text-2xl font-semibold mb-4">Προϊόντα</h1>

      <form className="grid gap-2 grid-cols-1 sm:grid-cols-4 mb-4">
        <input name="q" defaultValue={q} placeholder="Αναζήτηση…" className="border rounded px-3 py-2" />
        <input name="min" defaultValue={min} placeholder="Ελάχιστη τιμή" className="border rounded px-3 py-2" />
        <input name="max" defaultValue={max} placeholder="Μέγιστη τιμή" className="border rounded px-3 py-2" />
        <select name="category" defaultValue={category} className="border rounded px-3 py-2">
          <option value="all">Όλες οι κατηγορίες</option>
          <option value="Ελιές">Ελιές</option>
          <option value="Μέλι">Μέλι</option>
          <option value="Γαλακτοκομικά">Γαλακτοκομικά</option>
          <option value="Λάδια">Λάδια</option>
          <option value="Βότανα">Βότανα</option>
        </select>
        <button className="sm:col-span-4 bg-black text-white px-4 py-2 rounded">Εφαρμογή</button>
      </form>

      {!data.ok ? (
        <div className="text-red-600">Πρόβλημα φόρτωσης. Δοκίμασε ανανέωση.</div>
      ) : data.count === 0 ? (
        <div className="text-gray-500">Δεν βρέθηκαν προϊόντα.</div>
      ) : (
        <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map(p => (
            <li key={p.id} className="border rounded p-3 hover:shadow-sm transition">
              <div className="text-sm text-gray-500">{p.category}</div>
              <div className="font-medium">{p.title}</div>
              <div className="mt-1">{fmtEUR(p.price)} <span className="text-gray-500">/ {p.unit}</span></div>
              <div className="mt-1 text-sm">{p.stock > 0 ? `Διαθέσιμο (${p.stock})` : 'Εξαντλημένο'}</div>
              <div className="mt-2">
                <Link href={`/product/${p.id}`} className="text-blue-600 hover:underline">Λεπτομέρειες</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
