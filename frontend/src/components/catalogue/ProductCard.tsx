'use client';
import Link from 'next/link';
import { formatCurrency } from '@/lib/format';

interface ProductCardProps {
  id: number;
  slug?: string;
  name: string;
  price: number;
  currency?: string;
  producer?: { name: string };
}

export default function ProductCard({ id, slug, name, price, currency = 'EUR', producer }: ProductCardProps) {
  const href = `/products/${slug || id}`;
  return (
    <Link
      href={href}
      className="block border rounded-lg p-4 bg-white shadow-surface-sm hover:shadow-surface-md transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <div className="aspect-square bg-neutral-100 rounded mb-3 flex items-center justify-center text-neutral-400 text-sm">
        Εικόνα
      </div>
      <h3 className="font-medium text-neutral-900">{name}</h3>
      {producer?.name && <p className="mt-1 text-sm text-neutral-600">{producer.name}</p>}
      <p className="mt-2 font-semibold text-brand">{formatCurrency(price, currency)}</p>
    </Link>
  );
}
