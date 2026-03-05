'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import AddToCartButton from '@/components/AddToCartButton'
import FavoriteButton from '@/components/FavoriteButton'
import StarRating from '@/components/StarRating'

/**
 * ProductCard — Commerce-first design (Skroutz/Instacart pattern)
 *
 * Key decisions:
 * - Sans-serif everywhere (no font-display)
 * - Square image (1:1)
 * - Price is bold and prominent
 * - Compact padding, tight layout
 * - Light border, subtle shadow on hover
 * - "+" add-to-cart always visible
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
  cultivationType?: string | null
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

  const producerUrl = (producerSlug || producerId) ? `/producers/${producerSlug || producerId}` : null

  return (
    <div data-testid="product-card" className="group flex flex-col h-full bg-white rounded-xl overflow-hidden border border-neutral-200/70 hover:border-neutral-300 hover:shadow-md transition-all duration-200">
      {/* Image */}
      <Link href={productUrl} className="block relative">
        <div data-testid="product-card-image" className={`relative aspect-[4/3] sm:aspect-square w-full bg-neutral-100 overflow-hidden${isOOS ? ' opacity-50 grayscale' : ''}`}>
          {hasImage ? (
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
              priority={priority}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-300">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Badges — top-left */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isOOS && (
              <span data-testid="badge-oos" className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold bg-neutral-800 text-white">
                Εξαντλήθηκε
              </span>
            )}
            {isSeasonal && (
              <span data-testid="badge-seasonal" className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold bg-amber-400 text-white">
                Εποχιακό
              </span>
            )}
            {hasDiscount && (
              <span data-testid="badge-discount" className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold bg-red-500 text-white">
                -{Math.round(((priceCents - discountPriceCents) / priceCents) * 100)}%
              </span>
            )}
            {cultivationType && cultivationType !== 'conventional' && (
              <span data-testid="badge-cultivation" className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold ${
                cultivationType === 'organic_certified' ? 'bg-green-600 text-white' :
                cultivationType === 'organic_transitional' ? 'bg-lime-600 text-white' :
                cultivationType === 'biodynamic' ? 'bg-purple-600 text-white' :
                cultivationType === 'traditional_natural' ? 'bg-amber-600 text-white' :
                'bg-neutral-600 text-white'
              }`}>
                {cultivationType === 'organic_certified' ? 'Βιολογικό' :
                 cultivationType === 'organic_transitional' ? 'Βιολογικό' :
                 cultivationType === 'biodynamic' ? 'Βιοδυναμικό' :
                 cultivationType === 'traditional_natural' ? 'Παραδοσιακό' :
                 cultivationType}
              </span>
            )}
          </div>
          {/* S1-04: Favorite heart button — top right, subtle on hover (desktop) */}
          <div className="absolute top-1.5 right-1.5 z-10 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
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
              size="xs"
            />
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 sm:p-3.5">
        {/* Producer */}
        {producerUrl && !hideProducerLink ? (
          <Link
            href={producerUrl}
            data-testid="product-card-producer-link"
            className="text-[11px] sm:text-xs text-neutral-400 truncate block hover:text-primary transition-colors mb-1"
          >
            {producer || 'Παραγωγός'}
          </Link>
        ) : (
          <span data-testid="product-card-producer" className="text-[11px] sm:text-xs text-neutral-400 truncate block mb-1">
            {producer || 'Παραγωγός'}
          </span>
        )}

        {/* Title */}
        <Link href={productUrl} className="block mb-1.5">
          <h3 data-testid="product-card-title" className="text-sm sm:text-[15px] font-medium text-neutral-800 line-clamp-2 leading-snug hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>

        {/* Rating */}
        {reviewsAvgRating != null && reviewsAvgRating > 0 && (
          <div className="mb-1.5" data-testid="product-card-rating">
            <StarRating rating={reviewsAvgRating} count={reviewsCount} size="xs" />
          </div>
        )}

        {/* Price + Add to Cart — pushed to bottom */}
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span data-testid="product-card-price" className={`text-base sm:text-lg font-bold ${hasDiscount ? 'text-red-600' : 'text-neutral-900'}`}>
              {displayPrice}
            </span>
            {originalPrice && <span className="text-[11px] sm:text-xs text-neutral-400 line-through">{originalPrice}</span>}
          </div>
          <div data-testid="product-card-add" className="flex-shrink-0">
            <AddToCartButton id={String(id)} title={title} priceCents={priceCents} imageUrl={image || undefined} producerId={producerId ? String(producerId) : undefined} producerName={producer || undefined} stock={stock} compact />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div data-testid="product-card-skeleton" className="flex flex-col h-full bg-white rounded-xl border border-neutral-200/70 overflow-hidden animate-pulse">
      <div className="aspect-[4/3] sm:aspect-square bg-neutral-100 w-full" />
      <div className="p-3 sm:p-3.5 flex-grow flex flex-col">
        <div className="h-3 bg-neutral-100 w-1/3 mb-2 rounded" />
        <div className="h-4 bg-neutral-100 w-full mb-1.5 rounded" />
        <div className="h-4 bg-neutral-100 w-2/3 mb-3 rounded" />
        <div className="mt-auto flex items-center justify-between">
          <div className="h-5 bg-neutral-100 w-16 rounded" />
          <div className="h-10 w-10 bg-neutral-100 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
