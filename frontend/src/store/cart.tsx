'use client'
import React from 'react'

type CartItem = {
  id: string | number
  title: string
  priceFormatted: string
  price: number  // numeric price for calculations
  currency: string
  imageUrl?: string
  producer?: string
  qty: number
}

type CartState = {
  items: CartItem[]
  count: number
  total: number  // numeric total for calculations
  totalText: string
  add: (item: Omit<CartItem,'qty'>, qty?: number) => void
  clear: () => void
}

const Ctx = React.createContext<CartState | null>(null)

function readLS(): CartItem[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem('dixis_cart') || '[]') } catch { return [] }
}
function writeLS(items: CartItem[]) {
  try { localStorage.setItem('dixis_cart', JSON.stringify(items)) } catch {}
}
function sumTotalText(items: CartItem[]) {
  const count = items.reduce((n,i)=>n+i.qty,0)
  const total = items.reduce((sum,i)=>sum+(i.price*i.qty),0)
  return { count, total, totalText: `${count} τεμ.` }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([])

  React.useEffect(() => { setItems(readLS()) }, [])
  React.useEffect(() => { writeLS(items) }, [items])

  const add: CartState['add'] = (item, qty=1) => {
    setItems(prev => {
      const idx = prev.findIndex(p => p.id === item.id)
      const next = [...prev]
      if (idx >= 0) next[idx] = { ...next[idx], qty: next[idx].qty + qty }
      else next.push({ ...item, qty })
      return next
    })
  }
  const clear = () => setItems([])

  const { count, total, totalText } = sumTotalText(items)
  const value: CartState = { items, count, total, totalText, add, clear }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// SSR-safe hook: σε server render γυρνάει stub για να μη σκάει τίποτα
export function useCart(): CartState {
  const v = React.useContext(Ctx)
  if (!v) return { items: [], count: 0, total: 0, totalText: '0 τεμ.', add: ()=>{}, clear: ()=>{} }
  return v
}
