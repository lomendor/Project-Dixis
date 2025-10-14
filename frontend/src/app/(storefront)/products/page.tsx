import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { apiUrl } from '@/lib/http/apiBase';
import { parse, toQuery, type ProductFilters } from '@/lib/search/params';

async function getProducts(filters: ProductFilters) {
  try {
    const qs = toQuery({ per_page: 20, ...filters });
    const url = apiUrl(`/api/public/products${qs ? `?${qs}` : ''}`);
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const j = await res.json();
    return j.items || j.data || [];
  } catch {
    return [];
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations();
  const params = await searchParams;
  const filters = parse(params);
  const items = await getProducts(filters);

  return (
    <main className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">{t('products.title')}</h1>

      <form method="GET" className="mb-6 p-4 border rounded bg-gray-50">
        <div className="text-lg font-medium mb-3">
          {t('products.filters.title')}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <input
            type="text"
            name="q"
            defaultValue={filters.q || ''}
            placeholder={t('products.filters.search')}
            className="border rounded px-3 py-2"
          />
          
          <input
            type="text"
            name="category"
            defaultValue={filters.category || ''}
            placeholder={t('products.filters.category')}
            className="border rounded px-3 py-2"
          />
          
          <input
            type="number"
            name="min"
            defaultValue={filters.min || ''}
            placeholder={t('products.filters.price_min')}
            min="0"
            step="0.01"
            className="border rounded px-3 py-2"
          />
          
          <input
            type="number"
            name="max"
            defaultValue={filters.max || ''}
            placeholder={t('products.filters.price_max')}
            min="0"
            step="0.01"
            className="border rounded px-3 py-2"
          />
          
          <label className="flex items-center gap-2 px-3 py-2">
            <input
              type="checkbox"
              name="stock"
              value="in"
              defaultChecked={filters.stock === 'in'}
            />
            <span>{t('products.filters.in_stock')}</span>
          </label>
        </div>
        
        <button
          type="submit"
          className="mt-3 bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
        >
          {t('products.filters.apply')}
        </button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="products-grid">
        {items.map((p: any) => (
          <Link
            key={p.id || p.slug || p.title}
            href={`/products/${p.slug || p.id}`}
            className="border rounded-lg overflow-hidden hover:shadow-md transition group"
            data-testid="product-card"
          >
            {/* Product Image */}
            <div className="aspect-square bg-gray-100 relative">
              {p.image_url ? (
                <img
                  src={p.image_url}
                  alt={p.title || t('product.title')}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* Stock Badge */}
              {p.stock !== undefined && (
                <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
                  p.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {p.stock > 0 ? t('products.card.stock') : t('products.card.outOfStock')}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-3">
              <h3 className="font-medium text-sm mb-1 line-clamp-2">{p.title || '—'}</h3>
              {p.category && (
                <p className="text-xs text-gray-600 mb-2">{p.category}</p>
              )}
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-semibold">
                  {typeof p.price === 'number'
                    ? new Intl.NumberFormat('el-GR', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(p.price)
                    : '—'}
                </span>
                {p.producer_name && (
                  <span className="text-xs text-gray-500">{p.producer_name}</span>
                )}
              </div>
            </div>
          </Link>
        ))}

        {items.length === 0 && (
          <div className="col-span-full text-center py-16" data-testid="empty-state">
            <svg className="mx-auto w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-500 text-lg">{t('products.empty')}</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm opacity-75">{t('products.note')}</div>
        
        <div className="flex gap-2">
          {filters.page && filters.page > 1 && (
            <Link
              href={`/products?${toQuery({ ...filters, page: filters.page - 1 })}`}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              {t('products.pagination.prev')}
            </Link>
          )}
          
          <Link
            href={`/products?${toQuery({ ...filters, page: (filters.page || 1) + 1 })}`}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            {t('products.pagination.next')}
          </Link>
        </div>
      </div>

      <div className="mt-4">
        <Link href="/" className="text-blue-600 hover:underline">
          {t('nav.home')}
        </Link>
      </div>
    </main>
  );
}
