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
  const hasImage = image && image.length > 0

  return (
    <div data-testid="product-card" className="group flex flex-col h-full bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-emerald-100/50 hover:-translate-y-1 transition-all duration-300">
      <div data-testid="product-card-image" className="relative aspect-square w-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {hasImage ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
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
          <span data-testid="product-card-price" className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-emerald-600 text-white shadow-lg">
            {price}
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-grow p-4">
        {/* Producer */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <span data-testid="product-card-producer" className="text-xs font-medium text-emerald-700 uppercase tracking-wide">
            {producer || 'Παραγωγός'}
          </span>
        </div>
        {/* Product name */}
        <h3 data-testid="product-card-title" className="font-semibold text-gray-900 line-clamp-2 group-hover:text-emerald-700 transition-colors">
          {title}
        </h3>

        <div className="mt-auto pt-4">
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
