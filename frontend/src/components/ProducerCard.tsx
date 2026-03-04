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
      className="group flex flex-col h-full bg-white rounded-xl overflow-hidden border border-neutral-200/70 hover:border-neutral-300 hover:shadow-md transition-all duration-200"
    >
      <div className="relative aspect-[3/2] w-full bg-neutral-50 overflow-hidden">
        {hasImage ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-pale to-[#edf6f0] text-primary/30">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
        {/* Subtle gradient at bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
      </div>

      <div className="px-4 pt-4 pb-2 flex-grow flex flex-col">
        <h2 className="text-base font-semibold text-neutral-900 line-clamp-1 leading-tight">
          {name}
        </h2>
        <p className="text-xs text-neutral-400 mt-1.5 flex items-center gap-1.5">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {region}
        </p>
        {description && (
          <p className="text-sm text-neutral-500 mt-2.5 line-clamp-2 leading-relaxed">{description}</p>
        )}
      </div>

      <div className="px-4 pb-4 mt-auto pt-2.5 border-t border-neutral-100/80 flex items-center justify-between">
        <span className="text-xs text-neutral-400">
          {productsCount} {productsCount === 1 ? 'προϊόν' : 'προϊόντα'}
        </span>
        <span className="text-xs font-medium text-primary group-hover:underline">
          Η Ιστορία του &rarr;
        </span>
      </div>
    </Link>
  )
}

