import { create } from 'zustand'
import React from 'react'

export interface CartItem {
  id: string | number
  title: string
  producer: string
  priceCents: number
  imageUrl?: string
  qty: number
}

interface CartState {
  items: CartItem[]
  add: (item: Omit<CartItem, 'qty'>) => void
  remove: (id: string | number) => void
  inc: (id: string | number) => void
  dec: (id: string | number) => void
  clear: () => void
  count: () => number
  subtotalCents: () => number
}

const STORAGE_KEY = 'dixis:cart:v1'

// SSR-safe localStorage access
const getStoredCart = (): CartItem[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const setStoredCart = (items: CartItem[]) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (e) {
    console.error('Failed to save cart:', e)
  }
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  add: (item) => {
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id)
      const newItems = existing
        ? state.items.map((i) =>
            i.id === item.id ? { ...i, qty: i.qty + 1 } : i
          )
        : [...state.items, { ...item, qty: 1 }]
      setStoredCart(newItems)
      return { items: newItems }
    })
  },

  remove: (id) => {
    set((state) => {
      const newItems = state.items.filter((i) => i.id !== id)
      setStoredCart(newItems)
      return { items: newItems }
    })
  },

  inc: (id) => {
    set((state) => {
      const newItems = state.items.map((i) =>
        i.id === id ? { ...i, qty: i.qty + 1 } : i
      )
      setStoredCart(newItems)
      return { items: newItems }
    })
  },

  dec: (id) => {
    set((state) => {
      const newItems = state.items
        .map((i) => (i.id === id ? { ...i, qty: Math.max(0, i.qty - 1) } : i))
        .filter((i) => i.qty > 0)
      setStoredCart(newItems)
      return { items: newItems }
    })
  },

  clear: () => {
    setStoredCart([])
    set({ items: [] })
  },

  count: () => {
    return get().items.reduce((sum, item) => sum + item.qty, 0)
  },

  subtotalCents: () => {
    return get().items.reduce((sum, item) => sum + item.priceCents * item.qty, 0)
  },
}))

// Client-side hydration from localStorage
if (typeof window !== 'undefined') {
  const stored = getStoredCart()
  if (stored.length > 0) {
    useCartStore.setState({ items: stored })
  }
}

// ============================================================================
// BACKWARDS COMPATIBILITY LAYER
// ============================================================================
// Legacy useCart hook for existing components
// Wraps the new zustand store with the old API

export function useCart() {
  const items = useCartStore((s) => s.items)
  const addToStore = useCartStore((s) => s.add)
  const removeFromStore = useCartStore((s) => s.remove)
  const incStore = useCartStore((s) => s.inc)
  const decStore = useCartStore((s) => s.dec)
  const clearStore = useCartStore((s) => s.clear)
  const count = useCartStore((s) => s.count())

  // Convert new format to old format for legacy components
  const legacyItems = items.map((item) => ({
    id: item.id,
    title: item.title,
    qty: item.qty,
    price: item.priceCents / 100, // Convert cents to EUR
    currency: 'EUR',
    priceFormatted: new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: 'EUR',
    }).format(item.priceCents / 100),
    imageUrl: item.imageUrl,
    producer: item.producer,
  }))

  const total = legacyItems.reduce((sum, item) => sum + item.price * item.qty, 0)

  // Legacy add function: accepts old format { id, title, price, currency }
  const add = (
    item: {
      id: string | number
      title: string
      price: number
      currency?: string
      priceFormatted?: string
    },
    qty: number = 1
  ) => {
    // Convert to new format
    const priceCents = Math.round(item.price * 100)
    for (let i = 0; i < qty; i++) {
      addToStore({
        id: item.id,
        title: item.title,
        producer: 'Παραγωγός',
        priceCents,
      })
    }
  }

  const remove = (id: string | number) => {
    removeFromStore(id)
  }

  const inc = (id: string | number) => {
    incStore(id)
  }

  const dec = (id: string | number) => {
    decStore(id)
  }

  const clear = () => {
    clearStore()
  }

  return {
    items: legacyItems,
    total,
    count,
    add,
    remove,
    inc,
    dec,
    clear,
  }
}

// Legacy CartProvider component (no-op since zustand doesn't need provider)
export function CartProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  return React.createElement(React.Fragment, {}, children)
}
