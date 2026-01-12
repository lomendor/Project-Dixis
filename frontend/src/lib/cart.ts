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
 * - 'conflict': Item from different producer, needs user confirmation
 */
export type AddResult =
  | { status: 'added' }
  | { status: 'conflict'; currentProducerId: string; currentProducerName: string; newProducerId: string; newProducerName: string }

type State = {
  items: Record<string, CartItem>
  /** Attempts to add item. Returns conflict info if producer mismatch. */
  add: (item: Omit<CartItem,'qty'>) => AddResult
  inc: (id: string) => void
  dec: (id: string) => void
  clear: () => void
  /** Force-add item after user confirms (clears cart first) */
  forceAdd: (item: Omit<CartItem,'qty'>) => void
}

export const useCart = create<State>()(
  persist(
    (set, get) => ({
      items: {},
      add: (p): AddResult => {
        const items = { ...get().items }
        const existing = Object.values(items)[0]

        // Option A Guard: One producer per order
        // If cart has items from a different producer, return conflict
        if (existing && p.producerId && existing.producerId && existing.producerId !== p.producerId) {
          return {
            status: 'conflict',
            currentProducerId: existing.producerId,
            currentProducerName: existing.producerName || 'Παραγωγός',
            newProducerId: p.producerId,
            newProducerName: p.producerName || 'Παραγωγός',
          }
        }

        // Same producer or empty cart - proceed with add
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
    }),
    { name: 'dixis:cart:v1' }
  )
)

export const cartCount = (items: Record<string, CartItem>) =>
  Object.values(items).reduce((n, it) => n + it.qty, 0)

export const cartTotalCents = (items: Record<string, CartItem>) =>
  Object.values(items).reduce((sum, it) => sum + it.priceCents * it.qty, 0)
