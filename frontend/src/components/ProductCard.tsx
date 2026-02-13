'use client'
import React from 'react'
import Link from 'next/link'
import AddToCartButton from '@/components/AddToCartButton'

/**
 * Pass FIX-STOCK-GUARD-01: Added stock prop for OOS awareness
 */
type Props = {
  id: string | number
  title: string
  producer: string | null
  producerId?: string | number | null
  producerSlug?: string | null
  priceCents: number
  image?: string | null
  stock?: number | null
}

const fmtEUR = new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' })

export function ProductCard({ id, title, producer, producerId, producerSlug, priceCents, image, stock }: Props) {
  const price = typeof priceCents === 'number' ? fmtEUR.format(priceCents / 100) : '—'
  const hasImage = image && image.length > 0
  const productUrl = `/products/${id}`

  // Pass FIX-MOBILE-CARDS-01: Build producer link — prefer slug for clean URLs
  const producerUrl = (producerSlug || producerId) ? `/producers/${producerSlug || producerId}` : null

  return (
    <div data-testid="product-card" className="group flex flex-col h-full bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-card-hover hover:border-primary/20 transition-all duration-300">
      {/* Clickable section - navigates to product page */}
      <Link href={productUrl} className="flex flex-col touch-manipulation active:scale-[0.99]">
        <div data-testid="product-card-image" className="relative aspect-square sm:h-48 sm:aspect-auto w-full bg-neutral-100 overflow-hidden">
          {hasImage ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Pass FIX-MOBILE-CARDS-01: Reduced padding on mobile for better space usage */}
        <div className="px-2.5 pt-3 pb-1.5 sm:px-4 sm:pt-4 sm:pb-2">
          <span data-testid="product-card-producer" className="text-xs font-semibold text-primary uppercase tracking-wider truncate block">
            {producer || 'Παραγωγός'}
          </span>
          <h3 data-testid="product-card-title" className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 mt-1 leading-tight">
            {title}
          </h3>
        </div>
      </Link>

      {/* Pass FIX-MOBILE-CARDS-01: Producer link */}
      {producerUrl && (
        <div className="px-2.5 sm:px-4 pb-1">
          <Link
            href={producerUrl}
            data-testid="product-card-producer-link"
            className="inline-flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Δες τον παραγωγό</span>
          </Link>
        </div>
      )}

      {/* Non-clickable section - price + add to cart button */}
      {/* Pass FIX-MOBILE-CARDS-01: Stack vertically on mobile, row on sm+ */}
      <div className="px-2.5 pb-3 sm:px-4 sm:pb-4 mt-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-neutral-100">
        <span data-testid="product-card-price" className="text-base sm:text-lg font-bold text-neutral-900">{price}</span>
        <div data-testid="product-card-add" className="w-full sm:w-auto">
          {/* Pass FIX-STOCK-GUARD-01: Include stock for OOS check */}
          {/* Pass CART-UX-FEEDBACK-01: Include imageUrl for cart thumbnails */}
          <AddToCartButton id={String(id)} title={title} priceCents={priceCents} imageUrl={image || undefined} producerId={producerId ? String(producerId) : undefined} producerName={producer || undefined} stock={stock} />
        </div>
      </div>
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div data-testid="product-card-skeleton" className="flex flex-col h-full bg-white border border-neutral-200 rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-square sm:h-48 sm:aspect-auto bg-neutral-200 w-full" />
      <div className="p-2.5 sm:p-4 flex-grow flex flex-col">
        <div className="h-3 bg-neutral-200 w-1/3 mb-3 rounded" />
        <div className="h-5 sm:h-6 bg-neutral-200 w-full mb-2 rounded" />
        <div className="h-5 sm:h-6 bg-neutral-200 w-2/3 rounded" />
        <div className="mt-auto pt-3 sm:pt-4 flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center border-t border-neutral-100">
          <div className="h-5 sm:h-6 bg-neutral-200 w-1/4 rounded" />
          <div className="h-9 bg-neutral-200 w-full sm:w-24 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
