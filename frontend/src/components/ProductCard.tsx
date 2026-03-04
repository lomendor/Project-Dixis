'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import AddToCartButton from '@/components/AddToCartButton'
import FavoriteButton from '@/components/FavoriteButton'
import StarRating from '@/components/StarRating'

/**
 * Pass FIX-STOCK-GUARD-01: Added stock prop for OOS awareness
 * Pass PRODUCT-CARD-RATINGS-01: Added reviewsCount + reviewsAvgRating
 * T5: Added priority prop for LCP image optimization
 */
type Props = {
  id: string | number
  title: string
  producer: string | null
  producerId?: string | number | null
  producerSlug?: string | null
  priceCents: number
  discountPriceCents?: number | null
  image?: string | null
  stock?: number | null
  isSeasonal?: boolean
  hideProducerLink?: boolean
  reviewsCount?: number
  reviewsAvgRating?: number | null
  /** S1-01: Cultivation type for badge overlay */
  cultivationType?: string | null
  /** T5: Set true for above-the-fold cards to preload LCP image */
  priority?: boolean
}

const fmtEUR = new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' })

export function ProductCard({ id, title, producer, producerId, producerSlug, priceCents, discountPriceCents, image, stock, isSeasonal, hideProducerLink, reviewsCount, reviewsAvgRating, cultivationType, priority }: Props) {
  const hasDiscount = discountPriceCents != null && discountPriceCents < priceCents
  const isOOS = typeof stock === 'number' && stock <= 0
  const displayPrice = hasDiscount ? fmtEUR.format(discountPriceCents / 100) : (typeof priceCents === 'number' ? fmtEUR.format(priceCents / 100) : '—')
  const originalPrice = hasDiscount ? fmtEUR.format(priceCents / 100) : null
  const hasImage = image && image.length > 0
  const productUrl = `/products/${id}`

  // Pass FIX-MOBILE-CARDS-01: Build producer link — prefer slug for clean URLs
  const producerUrl = (producerSlug || producerId) ? `/producers/${producerSlug || producerId}` : null

  return (
    <div data-testid="product-card" className="group flex flex-col h-full bg-white border border-neutral-200/80 rounded-xl overflow-hidden shadow-card hover:shadow-card-hover hover:border-accent-gold/30 hover:-translate-y-0.5 transition-all duration-300">
      {/* Image — navigates to product page */}
      <Link href={productUrl} className="flex flex-col touch-manipulation active:scale-[0.99]">
        <div data-testid="product-card-image" className={`relative aspect-square sm:aspect-[4/5] w-full bg-neutral-100 overflow-hidden${isOOS ? ' opacity-50 grayscale' : ''}`}>
          {hasImage ? (
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
              priority={priority}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Subtle gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
          {/* Pass SEASONAL-DISCOUNT-01 + T2.5-05: Badge overlays */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isOOS && (
              <span data-testid="badge-oos" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-neutral-200 text-neutral-600 shadow-sm">
                Εξαντλήθηκε
              </span>
            )}
            {isSeasonal && (
              <span data-testid="badge-seasonal" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-amber-100 text-amber-800 shadow-sm">
                🍊 Εποχιακό
              </span>
            )}
            {hasDiscount && (
              <span data-testid="badge-discount" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-red-100 text-red-700 shadow-sm">
                -{Math.round(((priceCents - discountPriceCents) / priceCents) * 100)}%
              </span>
            )}
            {/* S1-01: Cultivation type badge */}
            {cultivationType && cultivationType !== 'conventional' && (
              <span data-testid="badge-cultivation" className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold shadow-sm ${
                cultivationType === 'organic_certified' ? 'bg-green-100 text-green-800' :
                cultivationType === 'organic_transitional' ? 'bg-lime-100 text-lime-800' :
                cultivationType === 'biodynamic' ? 'bg-purple-100 text-purple-800' :
                cultivationType === 'traditional_natural' ? 'bg-amber-100 text-amber-800' :
                'bg-neutral-100 text-neutral-700'
              }`}>
                {cultivationType === 'organic_certified' ? '🌿 Βιολογικό' :
                 cultivationType === 'organic_transitional' ? '🌱 Βιολογικό' :
                 cultivationType === 'biodynamic' ? '✨ Βιοδυναμικό' :
                 cultivationType === 'traditional_natural' ? '🌾 Παραδοσιακό' :
                 cultivationType}
              </span>
            )}
          </div>
          {/* S1-04: Favorite heart button — top right */}
          <div className="absolute top-2 right-2 z-10">
            <FavoriteButton
              item={{
                id: String(id),
                title,
                priceCents,
                imageUrl: image || undefined,
                producer: producer || undefined,
                producerId: producerId ? String(producerId) : undefined,
                producerSlug: producerSlug || undefined,
              }}
            />
          </div>
        </div>
      </Link>

      {/* Producer name + product title */}
      <div className="px-2.5 pt-3 pb-1.5 sm:px-4 sm:pt-4 sm:pb-2">
        {producerUrl && !hideProducerLink ? (
          <Link
            href={producerUrl}
            data-testid="product-card-producer-link"
            className="text-sm font-medium text-accent-gold uppercase tracking-wider truncate block hover:underline transition-colors"
          >
            {producer || 'Παραγωγός'}
          </Link>
        ) : (
          <span data-testid="product-card-producer" className="text-sm font-medium text-accent-gold uppercase tracking-wider truncate block">
            {producer || 'Παραγωγός'}
          </span>
        )}
        <Link href={productUrl} className="block mt-1">
          <h3 data-testid="product-card-title" className="text-sm sm:text-base font-bold text-neutral-900 line-clamp-2 leading-tight hover:text-primary/80 transition-colors">
            {title}
          </h3>
        </Link>
        {/* Pass PRODUCT-CARD-RATINGS-01: Show star rating on card */}
        {reviewsAvgRating != null && reviewsAvgRating > 0 && (
          <div className="mt-1" data-testid="product-card-rating">
            <StarRating rating={reviewsAvgRating} count={reviewsCount} size="xs" />
          </div>
        )}
      </div>

      {/* Non-clickable section - price + add to cart button */}
      {/* Pass FIX-MOBILE-CARDS-01: Stack vertically on mobile, row on sm+ */}
      <div className="px-2.5 pb-3 sm:px-4 sm:pb-4 mt-auto flex flex-col gap-2 pt-2 border-t border-neutral-100 bg-accent-cream">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span data-testid="product-card-price" className={`text-base sm:text-lg font-bold ${hasDiscount ? 'text-red-600' : 'text-neutral-900'}`}>
            {displayPrice}
            {originalPrice && <span className="ml-1.5 text-xs sm:text-sm font-normal text-neutral-400 line-through">{originalPrice}</span>}
          </span>
          <div data-testid="product-card-add" className="w-full sm:w-auto">
            <AddToCartButton id={String(id)} title={title} priceCents={priceCents} imageUrl={image || undefined} producerId={producerId ? String(producerId) : undefined} producerName={producer || undefined} stock={stock} />
          </div>
        </div>
        <p className="text-[10px] text-primary/50 hidden sm:block">88% στον παραγωγό</p>
      </div>
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div data-testid="product-card-skeleton" className="flex flex-col h-full bg-white border border-neutral-200/80 rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-square sm:aspect-[4/5] bg-accent-beige/60 w-full" />
      <div className="p-2.5 sm:p-4 flex-grow flex flex-col">
        <div className="h-3 bg-accent-beige/60 w-1/3 mb-3 rounded" />
        <div className="h-5 sm:h-6 bg-accent-beige/60 w-full mb-2 rounded" />
        <div className="h-5 sm:h-6 bg-accent-beige/60 w-2/3 rounded" />
        <div className="mt-auto pt-3 sm:pt-4 flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center border-t border-neutral-100">
          <div className="h-5 sm:h-6 bg-accent-beige/60 w-1/4 rounded" />
          <div className="h-9 bg-accent-beige/60 w-full sm:w-24 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
