import { abs } from '@/lib/url';
import Link from 'next/link';

async function getProducts(){
  const res = await fetch(abs('/api/products?page=1&pageSize=8'), { cache: 'no-store' });
  if(!res.ok) return { items: [] as any[] };
  return res.json();
}

export default async function FeaturedProducts(){
  const { items=[] } = await getProducts();
  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Προτεινόμενα προϊόντα</h2>
          <p className="text-gray-600 mt-1">Επιλεγμένα με αγάπη από τους παραγωγούς μας</p>
        </div>
        <Link href="/products" className="inline-flex items-center gap-2 text-emerald-700 font-medium hover:text-emerald-800 transition-colors">
          Όλα τα προϊόντα
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      {items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-gray-600">Δεν υπάρχουν προϊόντα ακόμη.</p>
          <p className="text-gray-500 text-sm mt-1">Σύντομα θα έχουμε νέα προϊόντα!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((p:any)=>(
            <Link
              key={p.id}
              href={`/products/${p.slug || p.id}`}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-emerald-100/50 hover:-translate-y-1 transition-all duration-300"
            >
              {/* Image placeholder */}
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-300 relative">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {/* Price badge */}
                <div className="absolute bottom-3 right-3">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-emerald-600 text-white shadow-lg">
                    {p.price} {p.currency}
                  </span>
                </div>
              </div>
              <div className="p-4">
                {p.producer?.name && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-emerald-700 uppercase tracking-wide">{p.producer.name}</span>
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-emerald-700 transition-colors">{p.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
