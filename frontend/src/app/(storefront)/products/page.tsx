import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { apiPath } from '@/lib/runtime/urls';
import { parse, toQuery, type ProductFilters } from '@/lib/search/params';
import ProductGrid from '@/components/catalogue/ProductGrid';

async function getProducts(filters: ProductFilters) {
  try {
    const qs = toQuery({ per_page: 20, ...filters });
    const url = apiPath(`/api/public/products${qs ? `?${qs}` : ''}`);
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

          <select
            name="sort"
            defaultValue={filters.sort || ''}
            className="border rounded px-3 py-2"
          >
            <option value="">{t('products.filters.sort')}</option>
            <option value="newest">{t('products.filters.sort_newest')}</option>
            <option value="price_asc">{t('products.filters.sort_price_asc')}</option>
            <option value="price_desc">{t('products.filters.sort_price_desc')}</option>
          </select>
        </div>
        
        <button
          type="submit"
          className="mt-3 bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
        >
          {t('products.filters.apply')}
        </button>
      </form>

      <div data-testid="products-grid">
        <ProductGrid items={items.map((p: any) => ({
          id: p.id,
          slug: p.slug,
          name: p.title || p.name,
          price: p.price,
          currency: p.currency || 'EUR',
          producer: p.producer_name ? { name: p.producer_name } : undefined
        }))} />
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
