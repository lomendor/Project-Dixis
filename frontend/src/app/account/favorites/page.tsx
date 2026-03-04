'use client';

import Link from 'next/link';
import { useFavorites, favoritesCount } from '@/lib/favorites';
import { ProductCard } from '@/components/ProductCard';

/**
 * S1-04: My Favorites page.
 * No auth required — favorites are stored in localStorage.
 * When server sync is added later, this page can be wrapped in AuthGuard.
 */
export default function FavoritesPage() {
  const items = useFavorites(s => s.items);
  const count = favoritesCount(items);
  const favoritesList = Object.values(items);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Τα Αγαπημένα μου
          </h1>
          <p className="text-neutral-600">
            {count > 0
              ? `${count} ${count === 1 ? 'προϊόν' : 'προϊόντα'} στα αγαπημένα σας`
              : 'Αποθηκεύστε τα αγαπημένα σας προϊόντα εδώ'}
          </p>
        </div>

        {count === 0 ? (
          <div className="text-center py-16">
            <div className="text-neutral-300 mb-4">
              <svg className="mx-auto h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              Δεν έχετε αγαπημένα ακόμα
            </h3>
            <p className="text-neutral-500 mb-6 max-w-md mx-auto">
              Πατήστε το εικονίδιο καρδιάς σε οποιοδήποτε προϊόν για να το αποθηκεύσετε στα αγαπημένα σας.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-2.5 text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-light transition"
            >
              Εξερευνήστε Προϊόντα
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {favoritesList.map((fav) => (
              <ProductCard
                key={fav.id}
                id={fav.id}
                title={fav.title}
                producer={fav.producer || null}
                producerId={fav.producerId}
                producerSlug={fav.producerSlug}
                priceCents={fav.priceCents}
                image={fav.imageUrl}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
