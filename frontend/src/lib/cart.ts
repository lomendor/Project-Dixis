import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  id: string
  title: string
  priceCents: number
  imageUrl?: string
  qty: number
}

type State = {
  items: Record<string, CartItem>
  add: (item: Omit<CartItem,'qty'>) => void
  inc: (id: string) => void
  dec: (id: string) => void
  clear: () => void
}

export const useCart = create<State>()(
  persist(
    (set, get) => ({
      items: {},
      add: (p) => {
        const items = { ...get().items }
        const cur = items[p.id]
        items[p.id] = cur ? { ...cur, qty: cur.qty + 1 } : { ...p, qty: 1 }
        set({ items })
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
