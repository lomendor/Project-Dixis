'use client'

import FavoriteButton from '@/components/FavoriteButton'
import type { FavoriteItem } from '@/lib/favorites'

/**
 * S1-04: Client wrapper for FavoriteButton in product detail page.
 * Product detail page is a server component, so we need this thin client boundary.
 */
export default function FavoriteButtonDetail({ item }: { item: FavoriteItem }) {
  return <FavoriteButton item={item} size="lg" className="flex-shrink-0 mt-1" />
}
