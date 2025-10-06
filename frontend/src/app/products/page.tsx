import Link from 'next/link';
import { prisma } from '@/lib/db/client';

function num(v: any, d = 1) {
  const n = Number(v || d);
  return Number.isFinite(n) ? n : d;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const q = (searchParams?.q || '').toString().trim();
  const category = (searchParams?.category || '').toString().trim();
  const region = (searchParams?.region || '').toString().trim();
  const page = Math.max(1, num(searchParams?.page, 1));
  const take = 24;
  const skip = (page - 1) * take;

  const where: any = { isActive: true };
  if (q) where.title = { contains: q, mode: 'insensitive' as const };
  if (category) where.category = { equals: category };
  if (region) where.producer = { region: { equals: region } };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        price: true,
        unit: true,
        imageUrl: true,
        stock: true,
        category: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / take));

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Προϊόντα</h1>

      <form
        method="get"
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="Αναζήτηση τίτλου…"
          aria-label="Αναζήτηση"
          className="px-4 py-2 border rounded-md"
        />
        <input
          name="category"
          defaultValue={category}
          placeholder="Κατηγορία"
          aria-label="Κατηγορία"
          className="px-4 py-2 border rounded-md"
        />
        <input
          name="region"
          defaultValue={region}
          placeholder="Περιοχή"
          aria-label="Περιοχή παραγωγού"
          className="px-4 py-2 border rounded-md"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Φίλτρα
        </button>
      </form>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((p) => (
          <li
            key={p.id}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <Link
              href={`/product/${p.id}`}
              className="block no-underline text-inherit"
            >
              <img
                src={p.imageUrl || '/placeholder.png'}
                alt={p.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="font-semibold text-lg mb-2">{p.title}</h2>
                <div className="text-gray-700 mb-2">
                  {p.price} € / {p.unit}
                </div>
                {p.stock === 0 && (
                  <span className="inline-block px-2 py-1 text-sm text-red-700 bg-red-100 rounded">
                    Εξαντλήθηκε
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {items.length === 0 && (
        <p className="text-center text-gray-600 py-8">
          Δεν βρέθηκαν προϊόντα.
        </p>
      )}

      <nav className="flex items-center justify-center gap-4 mt-8">
        <Link
          href={`?q=${encodeURIComponent(q)}&category=${encodeURIComponent(
            category
          )}&region=${encodeURIComponent(region)}&page=${Math.max(1, page - 1)}`}
          className={`px-4 py-2 border rounded-md ${
            page <= 1
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gray-100'
          }`}
          aria-disabled={page <= 1}
        >
          ‹ Προηγούμενη
        </Link>
        <span className="text-gray-700">
          Σελίδα {page} / {totalPages}
        </span>
        <Link
          href={`?q=${encodeURIComponent(q)}&category=${encodeURIComponent(
            category
          )}&region=${encodeURIComponent(region)}&page=${Math.min(
            totalPages,
            page + 1
          )}`}
          className={`px-4 py-2 border rounded-md ${
            page >= totalPages
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gray-100'
          }`}
          aria-disabled={page >= totalPages}
        >
          Επόμενη ›
        </Link>
      </nav>
    </main>
  );
}
