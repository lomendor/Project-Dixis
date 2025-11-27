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
    <article className="border rounded-lg p-4 bg-white shadow-surface-sm hover:shadow-surface-md transition-shadow">
      <Link
        href={href}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <div className="aspect-square bg-neutral-100 rounded mb-3 overflow-hidden relative">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        <h3 className="font-medium text-neutral-900">{name}</h3>
        {producer?.name && <p className="mt-1 text-sm text-neutral-600">{producer.name}</p>}
        <p className="mt-2 font-semibold text-brand">{formatCurrency(price, currency)}</p>
      </Link>
      <div className="mt-2"><AddToCartButton id={id} title={name} price={price} currency={currency} className="w-full" /></div>
    </article>
  );
}
