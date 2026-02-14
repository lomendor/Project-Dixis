'use client'
import Link from 'next/link'

type Props = {
  id: string | number
  slug: string
  name: string
  region: string
  category?: string
  description?: string | null
  imageUrl?: string | null
  productsCount: number
}

export function ProducerCard({ id, slug, name, region, description, imageUrl, productsCount }: Props) {
  const hasImage = imageUrl && imageUrl.length > 0
  const href = `/producers/${slug || id}`

  return (
    <Link
      href={href}
      data-testid="producer-card"
      className="group flex flex-col h-full bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-card-hover hover:border-primary/20 transition-all duration-300"
    >
      <div className="relative aspect-[4/3] w-full bg-neutral-100 overflow-hidden">
        {hasImage ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-primary/15 text-primary/40">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium mt-2">Τοπικός Παραγωγός</span>
          </div>
        )}
      </div>

      <div className="px-4 pt-4 pb-2 flex-grow flex flex-col">
        <h2 className="text-base font-bold text-gray-900 line-clamp-1 leading-tight">
          {name}
        </h2>
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {region}
        </p>
        {description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{description}</p>
        )}
      </div>

      <div className="px-4 pb-4 mt-auto pt-2 border-t border-neutral-100 flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {productsCount} {productsCount === 1 ? 'προϊόν' : 'προϊόντα'}
        </span>
        <span className="text-sm font-medium text-primary group-hover:underline">
          Προφίλ →
        </span>
      </div>
    </Link>
  )
}

