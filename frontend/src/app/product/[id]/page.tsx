import { addToCartAction } from '@/app/cart/actions';
import { prisma } from '@/lib/db/client';
import Link from 'next/link';

export default async function Page({ params }: { params: { id: string } }) {
  const p = await prisma.product.findUnique({
    where: { id: params.id },
    include: { producer: true },
  });

  if (!p || !p.isActive) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Το προϊόν δεν είναι διαθέσιμο.
        </h1>
        <Link
          href="/products"
          className="inline-block mt-4 text-blue-600 hover:underline"
        >
          ← Επιστροφή στα προϊόντα
        </Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Link
        href="/products"
        className="inline-block mb-4 text-blue-600 hover:underline"
      >
        ← Πίσω στα προϊόντα
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img
            src={p.imageUrl || '/placeholder.png'}
            alt={p.title}
            className="w-full h-96 object-cover rounded-lg border"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4">{p.title}</h1>

          <div className="text-2xl font-semibold text-blue-600 mb-4">
            {p.price} € / {p.unit}
          </div>

          {p.stock === 0 ? (
            <div className="mb-6">
              <span className="inline-block px-4 py-2 text-lg font-medium text-red-700 bg-red-100 rounded-md">
                Εξαντλήθηκε
              </span>
              <p className="mt-2 text-gray-600">
                Το προϊόν δεν είναι διαθέσιμο αυτή τη στιγμή.
              </p>
            </div>
          ) : (
            <form className="mb-6">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <label htmlFor="qty" className="text-sm font-medium mb-1">
                    Ποσότητα
                  </label>
                  <input
                    id="qty"
                    name="qty"
                    type="number"
                    min="1"
                    max={p.stock}
                    defaultValue="1"
                    className="w-24 px-3 py-2 border rounded-md"
                    aria-label="Ποσότητα προϊόντος"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors mt-6"
                  aria-label="Προσθήκη στο καλάθι"
                >
                  Προσθήκη στο καλάθι
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Διαθέσιμα: {p.stock} τεμάχια
              </p>
            </form>
          )}

          {p.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Περιγραφή</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {p.description}
              </p>
            </div>
          )}

          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-2">Πληροφορίες</h2>
            <dl className="space-y-2 text-gray-700">
              <div className="flex gap-2">
                <dt className="font-medium">Παραγωγός:</dt>
                <dd>{p.producer?.name || '—'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium">Περιοχή:</dt>
                <dd>{p.producer?.region || '—'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium">Κατηγορία:</dt>
                <dd>{p.category}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </main>
  );
}
