'use client'
import Image from 'next/image'
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
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
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

