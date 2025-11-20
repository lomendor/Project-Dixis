'use client'
import { useEffect, useState } from 'react'

export default function CartBadge() {
  const [count, setCount] = useState<number>(0)
  async function refresh() {
    try {
      const res = await fetch('/api/cart', { cache:'no-store' })
      const data = await res.json()
      setCount((data?.items?.length) || 0)
    } catch { /* noop */ }
  }
  useEffect(() => {
    refresh()
    const h = () => refresh()
    window.addEventListener('cart:updated', h)
    return () => window.removeEventListener('cart:updated', h)
  }, [])
  return (
    <a href="/cart" className="text-sm underline">
      Καλάθι {count > 0 ? `(${count})` : ''}
    </a>
  )
}
