'use client'
import { useCart } from '@/lib/cart'
import { useState } from 'react'
import { useToast } from '@/contexts/ToastContext'
import { Plus, Check } from 'lucide-react'

/**
 * AddToCartButton — Commerce-first design
 *
 * Two modes:
 * - compact: Small "+" icon button for product cards (Skroutz/Instacart pattern)
 * - default: Full "Προσθήκη" text button for detail pages
 */
export default function AddToCartButton(props: {
  id: string | number
  title: string
  priceCents: number
  imageUrl?: string
  producerId?: string
  producerName?: string
  stock?: number | null
  compact?: boolean
}) {
  const add = useCart(s => s.add)
  const [isAdded, setIsAdded] = useState(false)
  const { showSuccess } = useToast()

  const isOutOfStock = typeof props.stock === 'number' && props.stock <= 0

  const handleClick = () => {
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

  // Compact mode — small icon button for cards
  if (props.compact) {
    if (isOutOfStock) {
      return (
        <button
          className="w-9 h-9 rounded-lg bg-neutral-100 text-neutral-400 cursor-not-allowed flex items-center justify-center"
          disabled
          aria-label={`${props.title} - Εξαντλήθηκε`}
          data-testid="add-to-cart-button"
          data-oos="true"
        >
          <Plus className="w-4 h-4" />
        </button>
      )
    }
    return (
      <button
        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-90 ${
          isAdded
            ? 'bg-green-500 text-white'
            : 'bg-primary text-white hover:bg-primary-light'
        }`}
        onClick={handleClick}
        disabled={isAdded}
        aria-label={`Προσθήκη ${props.title} στο καλάθι`}
        aria-live="polite"
        data-testid="add-to-cart-button"
      >
        {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
      </button>
    )
  }

  // Full mode — text button for detail pages
  if (isOutOfStock) {
    return (
      <button
        className="h-11 px-4 w-full sm:w-auto rounded-lg text-sm font-semibold bg-neutral-100 text-neutral-400 cursor-not-allowed"
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
      className={`h-11 px-5 w-full sm:w-auto rounded-lg text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${
        isAdded
          ? 'bg-green-500 text-white'
          : 'bg-primary text-white hover:bg-primary-light'
      }`}
      onClick={handleClick}
      disabled={isAdded}
      aria-label={`Προσθήκη ${props.title} στο καλάθι`}
      aria-live="polite"
      data-testid="add-to-cart-button"
    >
      {isAdded ? '✓ Προστέθηκε' : 'Στο Καλάθι'}
    </button>
  )
}
