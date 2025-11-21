'use client'
import React from 'react'
import AddToCartButton from '@/components/AddToCartButton'

type Props = {
  id: string | number
  title: string
  producer: string | null
  priceCents: number
  image?: string | null
}

export function ProductCard({ id, title, producer, priceCents, image }: Props) {
  const price = typeof priceCents === 'number' ? (priceCents / 100).toFixed(2) + '€' : '—'
  const displayImage = image && image.length > 0 ? image : '/demo/placeholder.jpg'

  return (
    <div data-testid="product-card" className="group flex flex-col h-full bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
      <div data-testid="product-card-image" className="relative h-48 w-full bg-gray-100 overflow-hidden">
        <img
          src={displayImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      <div className="flex flex-col flex-grow p-4">
        <div className="mb-2">
          <span data-testid="product-card-producer" className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            {producer || 'Παραγωγός'}
          </span>
          <h3 data-testid="product-card-title" className="text-base font-bold text-gray-900 line-clamp-2 mt-1 leading-tight">
            {title}
          </h3>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
          <span data-testid="product-card-price" className="text-lg font-bold text-gray-900">{price}</span>
          <div data-testid="product-card-add">
            <AddToCartButton id={String(id)} title={title} priceCents={priceCents} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div data-testid="product-card-skeleton" className="flex flex-col h-full bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200 w-full" />
      <div className="p-4 flex-grow flex flex-col">
        <div className="h-3 bg-gray-200 w-1/3 mb-3 rounded" />
        <div className="h-6 bg-gray-200 w-full mb-2 rounded" />
        <div className="h-6 bg-gray-200 w-2/3 rounded" />
        <div className="mt-auto pt-4 flex justify-between items-center border-t border-gray-50">
          <div className="h-6 bg-gray-200 w-1/4 rounded" />
          <div className="h-9 bg-gray-200 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
