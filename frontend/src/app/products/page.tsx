import Link from 'next/link';
import { prisma } from '@/lib/db/client';

// Make this page dynamic to avoid build-time database queries
export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search || '';
  const category = params.category || '';
  const page = Number(params.page || '1');
  const perPage = 24;

  const where = {
    isActive: true,
    ...(search && {
      title: { contains: search, mode: 'insensitive' as const }
    }),
    ...(category && { category })
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        title: true,
        category: true,
        price: true,
        unit: true,
        stock: true,
        imageUrl: true
      }
    }),
    prisma.product.count({ where })
  ]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Προϊόντα</h1>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <form className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Αναζήτηση προϊόντων..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <select
              name="category"
              defaultValue={category}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Όλες οι κατηγορίες</option>
              <option value="Φρούτα">Φρούτα</option>
              <option value="Λαχανικά">Λαχανικά</option>
              <option value="Γαλακτοκομικά">Γαλακτοκομικά</option>
              <option value="Άλλα">Άλλα</option>
            </select>
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Αναζήτηση
            </button>
          </form>
        </div>

        {/* Results count */}
        <p className="text-gray-600 mb-4">
          {total} {total === 1 ? 'προϊόν' : 'προϊόντα'}
        </p>

        {/* Product grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Δεν βρέθηκαν προϊόντα</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                >
                  {p.imageUrl && (
                    <div className="h-48 bg-gray-200">
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <span className="text-xs text-gray-500 uppercase">{p.category}</span>
                    <h3 className="font-semibold text-lg mt-1 mb-2">{p.title}</h3>
                    <p className="text-gray-900 font-bold mb-2">
                      €{Number(p.price).toFixed(2)}
                      {p.unit && <span className="text-sm text-gray-600">/{p.unit}</span>}
                    </p>
                    {Number(p.stock || 0) === 0 ? (
                      <span className="text-red-600 text-sm font-medium">Εξαντλημένο</span>
                    ) : Number(p.stock || 0) <= 5 ? (
                      <span className="text-orange-600 text-sm">
                        Μόνο {p.stock} διαθέσιμα
                      </span>
                    ) : (
                      <span className="text-green-600 text-sm">Διαθέσιμο</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/products?search=${search}&category=${category}&page=${page - 1}`}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                  >
                    Προηγούμενο
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .map((p, idx, arr) => (
                    <div key={p} className="flex items-center gap-2">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="text-gray-400">...</span>
                      )}
                      <Link
                        href={`/products?search=${search}&category=${category}&page=${p}`}
                        className={`px-4 py-2 rounded-lg ${
                          p === page
                            ? 'bg-green-600 text-white'
                            : 'border hover:bg-gray-100'
                        }`}
                      >
                        {p}
                      </Link>
                    </div>
                  ))}
                {page < totalPages && (
                  <Link
                    href={`/products?search=${search}&category=${category}&page=${page + 1}`}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                  >
                    Επόμενο
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
