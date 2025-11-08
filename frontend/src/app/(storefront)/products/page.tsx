export const dynamic = 'force-dynamic';

import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { parse, toQuery, type ProductFilters } from '@/lib/search/params';
import ProductCard from '../../../components/catalogue/ProductCard';

async function getProducts(filters: ProductFilters) {
  try {
    const params = new URLSearchParams({
      page: String(filters.page || 1),
      per_page: '20',
      ...(filters.q && { q: filters.q }),
      ...(filters.category && { category: filters.category }),
      ...(filters.min && { min: String(filters.min) }),
      ...(filters.max && { max: String(filters.max) }),
      ...(filters.stock && { stock: filters.stock }),
    });

    const res = await fetch(`/api/products?${params}`);
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
      <h1 className="text-2xl font-semibold mb-2">Προϊόντα</h1>
      <p className="text-gray-600 mb-6">Κατάλογος τοπικών προϊόντων</p>

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
            className="block"
          >
            <ProductCard
              id={p.id}
              title={p.title}
              price={p.price}
              currency={p.currency || 'EUR'}
              producer={p.producer_name ? { id: p.producer_id || '', name: p.producer_name } : null}
            />
          </Link>
        ))}

        {items.length === 0 && (
          <div className="col-span-full text-center py-16">
            <p className="text-gray-500 text-lg">Δεν υπάρχουν προϊόντα</p>
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
