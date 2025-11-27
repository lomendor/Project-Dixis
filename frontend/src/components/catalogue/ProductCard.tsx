'use client';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/format';
import AddToCartButton from '@/components/cart/AddToCartButton';

interface ProductCardProps {
  id: number;
  slug?: string;
  name: string;
  price: number;
  currency?: string;
  producer?: { name: string };
  imageUrl?: string | null;
}

export default function ProductCard({ id, slug, name, price, currency = 'EUR', producer, imageUrl }: ProductCardProps) {
  const href = `/products/${slug || id}`;
  return (
    <article className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-emerald-100/50 hover:-translate-y-1 transition-all duration-300">
      <Link
        href={href}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
      >
        {/* Image container */}
        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Price badge */}
          <div className="absolute bottom-3 right-3">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-emerald-600 text-white shadow-lg">
              {formatCurrency(price, currency)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Producer */}
          {producer?.name && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs font-medium text-emerald-700 uppercase tracking-wide">
                {producer.name}
              </span>
            </div>
          )}
          {/* Product name */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-emerald-700 transition-colors">
            {name}
          </h3>
        </div>
      </Link>

      {/* Add to cart */}
      <div className="px-4 pb-4">
        <AddToCartButton id={id} title={name} price={price} currency={currency} className="w-full" />
      </div>
    </article>
  );
}
