import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * S1-04: Wishlist/Favorites
 * Client-only store (localStorage). Server sync deferred until we have real users.
 * Pattern follows cart.ts (Zustand + persist).
 */

export type FavoriteItem = {
  id: string
  title: string
  priceCents: number
  imageUrl?: string
  producer?: string
  producerId?: string
  producerSlug?: string
}

type State = {
  items: Record<string, FavoriteItem>
  toggle: (item: FavoriteItem) => void
  remove: (id: string) => void
  isFavorite: (id: string) => boolean
  clear: () => void
}

export const useFavorites = create<State>()(
  persist(
    (set, get) => ({
      items: {},
      toggle: (item) => {
        const items = { ...get().items }
        if (items[item.id]) {
          delete items[item.id]
        } else {
          items[item.id] = item
        }
        set({ items })
      },
      remove: (id) => {
        const items = { ...get().items }
        delete items[id]
        set({ items })
      },
      isFavorite: (id) => !!get().items[id],
      clear: () => set({ items: {} }),
    }),
    { name: 'dixis:favorites:v1' }
  )
)

/** Number of favorites */
export const favoritesCount = (items: Record<string, FavoriteItem>) =>
  Object.keys(items).length
