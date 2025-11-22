'use client'
import { useCart } from '@/store/cart'
import { useState } from 'react'

export default function AddToCartButton(props: {
  id: string | number
  title: string
  priceCents: number
  imageUrl?: string
  producer?: string
}) {
  const { add } = useCart()
  const [isAdded, setIsAdded] = useState(false)
  const priceNum = props.priceCents / 100
  const priceFormatted = `€${priceNum.toFixed(2)}`

  const handleClick = () => {
    add({
      id: String(props.id),
      title: props.title,
      priceFormatted,
      price: priceNum,
      currency: 'EUR',
      imageUrl: props.imageUrl,
      producer: props.producer
    }, 1)

    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 900)
  }

  return (
    <button
      className={`h-9 px-3 rounded text-sm transition-colors ${
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
