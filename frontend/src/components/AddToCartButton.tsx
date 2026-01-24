'use client'
import { useCart } from '@/lib/cart'
import { useState } from 'react'

/**
 * AddToCartButton - Multi-producer carts now supported
 * (Pass SHIP-MULTI-PRODUCER-ENABLE-01)
 */
export default function AddToCartButton(props: {
  id: string | number
  title: string
  priceCents: number
  imageUrl?: string
  producerId?: string
  producerName?: string
}) {
  const add = useCart(s => s.add)
  const [isAdded, setIsAdded] = useState(false)

  const handleClick = () => {
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
    setTimeout(() => setIsAdded(false), 900)
  }

  return (
    <button
      className={`h-11 px-4 rounded text-sm transition-colors ${
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
