import Link from 'next/link';
import { abs } from '@/lib/url';

async function getProducts() {
  const res = await fetch(abs('/api/products?page=1&pageSize=8'), { cache: 'no-store' });
  if (!res.ok) return { items: [] as any[] };
  return res.json();
}

export default async function FeaturedProducts() {
  const { items = [] } = await getProducts();

  return (
    <section className="py-8 sm:py-12">
      {/* Section header - Mobile-first */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900">
            Προτεινόμενα προϊόντα
          </h2>
          <p className="mt-1 text-sm sm:text-base text-neutral-600">Φρέσκα προϊόντα από τους παραγωγούς μας</p>
        </div>
        <Link
          href="/products"
          className="hidden sm:inline-flex items-center gap-2 text-primary font-medium hover:text-primary-light transition-colors text-sm"
        >
          Όλα τα προϊόντα
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Products grid - Mobile-first: 1 col → 2 col sm → 3 col md → 4 col lg */}
      {items.length === 0 ? (
        <div className="text-center py-10 sm:py-12 bg-neutral-50 rounded-lg">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-neutral-200 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-sm sm:text-base text-neutral-600 mb-2 sm:mb-4">Δεν υπάρχουν προϊόντα ακόμη.</p>
          <p className="text-xs sm:text-sm text-neutral-500">Επιστρέψτε σύντομα για νέα προϊόντα!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((p: any) => (
            <Link
              key={p.id}
              href={`/products/${p.slug || p.id}`}
              className="group touch-manipulation"
            >
              <div className="bg-white rounded-md overflow-hidden shadow-card transition-all duration-200 group-hover:shadow-card-hover md:group-hover:-translate-y-1 active:scale-[0.99]">
                {/* Product image - square on mobile, 4:3 on larger */}
                <div className="aspect-square sm:aspect-[4/3] bg-gradient-to-br from-neutral-100 to-neutral-50 flex items-center justify-center">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>

                {/* Product info - Mobile-first padding */}
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-neutral-900 group-hover:text-primary transition-colors line-clamp-2 text-sm sm:text-base leading-snug">
                    {p.name}
                  </h3>
                  {p.producer?.name && (
                    <p className="mt-1 text-xs sm:text-sm text-neutral-600">{p.producer.name}</p>
                  )}
                  <div className="mt-2 sm:mt-3 flex items-center justify-between">
                    <span className="text-base sm:text-lg font-bold text-primary">
                      {p.price} {p.currency || 'EUR'}
                    </span>
                    {/* Hide "See more" text on mobile - tap is obvious */}
                    <span className="hidden sm:inline-block text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Δες περισσότερα
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Mobile view all link - prominent button style */}
      <div className="mt-6 sm:hidden">
        <Link
          href="/products"
          className="flex items-center justify-center gap-2 w-full py-3 bg-primary-pale text-primary font-semibold rounded-md active:scale-[0.98] touch-manipulation"
        >
          Δες όλα τα προϊόντα
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
