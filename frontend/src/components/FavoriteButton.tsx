'use client'

import { useFavorites, type FavoriteItem } from '@/lib/favorites'
import { useToast } from '@/contexts/ToastContext'

/**
 * S1-04: Heart toggle button for product cards and detail pages.
 *
 * Usage:
 *   <FavoriteButton item={{ id: '1', title: 'Ελαιόλαδο', priceCents: 1200 }} />
 *   <FavoriteButton item={...} size="lg" />  // For product detail page
 */
interface Props {
  item: FavoriteItem
  /** 'sm' for cards (default), 'lg' for product detail */
  size?: 'sm' | 'lg'
  className?: string
}

export default function FavoriteButton({ item, size = 'sm', className = '' }: Props) {
  const toggle = useFavorites(s => s.toggle)
  const isFav = useFavorites(s => s.isFavorite(item.id))
  const { showSuccess, showInfo } = useToast()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(item)
    if (!isFav) {
      showSuccess(`${item.title} στα αγαπημένα`, 1500)
    } else {
      showInfo('Αφαιρέθηκε από τα αγαπημένα', 1500)
    }
  }

  const sizeClasses = size === 'lg'
    ? 'w-10 h-10'
    : 'w-8 h-8'

  const iconSize = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isFav ? 'Αφαίρεση από αγαπημένα' : 'Προσθήκη στα αγαπημένα'}
      aria-pressed={isFav}
      data-testid="favorite-button"
      className={`
        inline-flex items-center justify-center rounded-full
        transition-all duration-200
        ${isFav
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : 'bg-white/80 text-neutral-400 hover:text-red-400 hover:bg-white'
        }
        ${sizeClasses}
        shadow-sm backdrop-blur-sm
        ${className}
      `}
    >
      <svg
        className={`${iconSize} transition-transform ${isFav ? 'scale-110' : ''}`}
        viewBox="0 0 24 24"
        fill={isFav ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  )
}
