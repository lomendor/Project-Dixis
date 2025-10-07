import Link from 'next/link';
import { prisma } from '@/lib/db/client';

// Make this page dynamic to avoid build-time database queries
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let featured: Array<{
    id: string;
    title: string;
    price: number;
    unit: string | null;
    stock: number | null;
    imageUrl: string | null;
  }> = [];

  try {
    featured = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        title: true,
        price: true,
        unit: true,
        stock: true,
        imageUrl: true
      }
    });
  } catch (e) {
    // Database not available during build, will work at runtime
    console.log('Featured products not available:', e);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Καλώς ήρθατε στο Project Dixis
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Ανακαλύψτε φρέσκα, ποιοτικά προϊόντα από τοπικούς παραγωγούς
        </p>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Κατηγορίες</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Φρούτα', 'Λαχανικά', 'Γαλακτοκομικά', 'Άλλα'].map((cat) => (
              <Link
                key={cat}
                href={`/products?category=${encodeURIComponent(cat)}`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-center"
              >
                <span className="text-lg font-medium text-gray-900">{cat}</span>
              </Link>
            ))}
          </div>
        </div>

        {featured.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Νέα Προϊόντα</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featured.map((p) => (
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
                    <h3 className="font-semibold text-lg mb-2">{p.title}</h3>
                    <p className="text-gray-900 font-bold">
                      €{Number(p.price).toFixed(2)}
                      {p.unit && <span className="text-sm text-gray-600">/{p.unit}</span>}
                    </p>
                    {Number(p.stock || 0) === 0 && (
                      <span className="text-red-600 text-sm">Εξαντλημένο</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <Link
            href="/products"
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Δείτε Όλα τα Προϊόντα
          </Link>
        </div>
      </div>
    </div>
  );
}
