import { abs } from '@/lib/url';

async function getProducts(){
  const res = await fetch(abs('/api/products?page=1&pageSize=8'), { cache: 'no-store' });
  if(!res.ok) return { items: [] as any[] };
  return res.json();
}

export default async function FeaturedProducts(){
  const { items=[] } = await getProducts();
  return (
    <section className="mt-8">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold">Προτεινόμενα προϊόντα</h2>
        <a href="/products" className="text-sm underline">Όλα τα προϊόντα</a>
      </div>
      {items.length === 0 ? (
        <p className="mt-4 text-neutral-600">Δεν υπάρχουν προϊόντα ακόμη.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((p:any)=>(
            <div key={p.id} className="border rounded-lg p-4 bg-white shadow-surface-sm hover:shadow-surface-md transition-shadow">
              <h3 className="font-medium text-neutral-900">{p.name}</h3>
              <p className="mt-1 text-sm text-neutral-600">{p.producer?.name}</p>
              <p className="mt-2 font-semibold text-brand">{p.price} {p.currency}</p>
              <a
                href={`/products/${p.slug || p.id}`}
                className="mt-3 inline-block text-sm text-brand underline"
              >
                Δες προϊόν
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
