'use client'

import { create } from 'zustand'

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
