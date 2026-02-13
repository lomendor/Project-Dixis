import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  id: string
  title: string
  priceCents: number
  imageUrl?: string
  qty: number
  producerId?: string
  producerName?: string
}

/**
 * Result from attempting to add an item to cart
 * - 'added': Item was added successfully
 *
 * Note: Multi-producer carts are now allowed (Pass SHIP-MULTI-PRODUCER-ENABLE-01)
 */
export type AddResult = { status: 'added' }

type State = {
  items: Record<string, CartItem>
  /** Attempts to add item. Returns conflict info if producer mismatch. */
  add: (item: Omit<CartItem,'qty'>) => AddResult
  inc: (id: string) => void
  dec: (id: string) => void
  clear: () => void
  /** Force-add item after user confirms (clears cart first) */
  forceAdd: (item: Omit<CartItem,'qty'>) => void
  /** Replace cart with server items (used after sync) */
  replaceWithServerCart: (serverItems: CartItem[]) => void
  /** Get items in format suitable for sync API */
  getItemsForSync: () => { product_id: number; quantity: number }[]
}

export const useCart = create<State>()(
  persist(
    (set, get) => ({
      items: {},
      add: (p): AddResult => {
        const items = { ...get().items }
        // Multi-producer carts allowed (Pass SHIP-MULTI-PRODUCER-ENABLE-01)
        const cur = items[p.id]
        items[p.id] = cur ? { ...cur, qty: cur.qty + 1 } : { ...p, qty: 1 }
        set({ items })
        return { status: 'added' }
      },
      forceAdd: (p) => {
        // Clear cart and add new item (user confirmed replacing cart)
        set({ items: { [p.id]: { ...p, qty: 1 } } })
      },
      inc: (id) => {
        const items = { ...get().items }
        const cur = items[id]
        if (!cur) return
        items[id] = { ...cur, qty: cur.qty + 1 }
        set({ items })
      },
      dec: (id) => {
        const items = { ...get().items }
        const cur = items[id]
        if (!cur) return
        const nextQty = cur.qty - 1
        if (nextQty <= 0) {
          delete items[id]
        } else {
          items[id] = { ...cur, qty: nextQty }
        }
        set({ items })
      },
      clear: () => set({ items: {} }),
      replaceWithServerCart: (serverItems: CartItem[]) => {
        const newItems: Record<string, CartItem> = {}
        for (const item of serverItems) {
          newItems[item.id] = item
        }
        set({ items: newItems })
      },
      getItemsForSync: () => {
        const items = get().items
        return Object.values(items)
          .filter(item => item.id && !isNaN(parseInt(item.id, 10)) && item.qty > 0)
          .map(item => ({
            product_id: parseInt(item.id, 10),
            quantity: item.qty,
          }))
      },
    }),
    { name: 'dixis:cart:v1' }
  )
)

export const cartCount = (items: Record<string, CartItem>) =>
  Object.values(items).reduce((n, it) => n + it.qty, 0)

export const cartTotalCents = (items: Record<string, CartItem>) =>
  Object.values(items).reduce((sum, it) => sum + it.priceCents * it.qty, 0)

/**
 * Returns the set of unique producer IDs in the cart.
 * Used to detect multi-producer carts for checkout blocking.
 * (Pass HOTFIX-MP-CHECKOUT-GUARD-01)
 */
export const getProducerIds = (items: Record<string, CartItem>): Set<string> => {
  const ids = new Set<string>()
  for (const item of Object.values(items)) {
    if (item.producerId) {
      ids.add(item.producerId)
    }
  }
  return ids
}

/**
 * Returns true if cart contains items from more than one producer.
 * Multi-producer checkout is not yet supported.
 * (Pass HOTFIX-MP-CHECKOUT-GUARD-01)
 */
export const isMultiProducerCart = (items: Record<string, CartItem>): boolean => {
  return getProducerIds(items).size > 1
}
