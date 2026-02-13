'use client'
import { useCart } from '@/lib/cart'
import { useState } from 'react'
import { useToast } from '@/contexts/ToastContext'

/**
 * AddToCartButton - Multi-producer carts now supported
 * (Pass SHIP-MULTI-PRODUCER-ENABLE-01)
 *
 * Pass FIX-STOCK-GUARD-01: Added stock awareness
 * - Disables button when stock <= 0
 * - Shows "Εξαντλήθηκε" (Out of Stock) label
 */
export default function AddToCartButton(props: {
  id: string | number
  title: string
  priceCents: number
  imageUrl?: string
  producerId?: string
  producerName?: string
  stock?: number | null
}) {
  const add = useCart(s => s.add)
  const [isAdded, setIsAdded] = useState(false)
  const { showSuccess } = useToast()

  // Pass FIX-STOCK-GUARD-01: Check if product is out of stock
  const isOutOfStock = typeof props.stock === 'number' && props.stock <= 0

  const handleClick = () => {
    // Pass FIX-STOCK-GUARD-01: Prevent adding OOS items
    if (isOutOfStock) return

    const item = {
      id: String(props.id),
      title: props.title,
      priceCents: props.priceCents,
      imageUrl: props.imageUrl,
      producerId: props.producerId,
      producerName: props.producerName,
    }

    add(item)
    setIsAdded(true)
    showSuccess(`${props.title} προστέθηκε στο καλάθι`, 2000)
    setTimeout(() => setIsAdded(false), 900)
  }

  // Pass FIX-STOCK-GUARD-01: Show OOS state with distinct styling
  if (isOutOfStock) {
    return (
      <button
        className="h-9 sm:h-11 px-3 sm:px-4 w-full sm:w-auto rounded text-sm bg-red-100 text-red-600 cursor-not-allowed"
        disabled
        aria-label={`${props.title} - Εξαντλήθηκε`}
        aria-live="polite"
        data-testid="add-to-cart-button"
        data-oos="true"
      >
        Εξαντλήθηκε
      </button>
    )
  }

  return (
    <button
      className={`h-9 sm:h-11 px-3 sm:px-4 w-full sm:w-auto rounded text-sm transition-colors ${
        isAdded
          ? 'bg-emerald-600 text-white'
          : 'bg-neutral-900 text-white hover:bg-neutral-800'
      }`}
      onClick={handleClick}
      disabled={isAdded}
      aria-label={`Προσθήκη ${props.title} στο καλάθι`}
      aria-live="polite"
      data-testid="add-to-cart-button"
    >
      {isAdded ? '✓ Προστέθηκε' : 'Προσθήκη'}
    </button>
  )
}
