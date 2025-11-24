'use client'
import * as React from 'react'
import { useCart, cartCount } from '@/lib/cart'
import Link from 'next/link'

export function CartBadge() {
  const items = useCart(s => s.items)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => { setMounted(true) }, [])

  // @/lib/cart (Zustand) - use cartCount helper
  const displayCount = mounted ? cartCount(items) : 0

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center gap-2 rounded-lg px-3 py-2 border border-gray-200 bg-white hover:shadow-md transition-shadow"
      aria-label="Μετάβαση στο καλάθι"
      data-testid="cart-badge"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      <span className="text-sm font-medium">Καλάθι</span>
      {displayCount > 0 && (
        <span
          className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-emerald-600 px-1.5 text-xs font-bold text-white"
          aria-live="polite"
          aria-atomic="true"
        >
          {displayCount}
        </span>
      )}
    </Link>
  )
}
