'use client'
import { useCart } from '@/store/cart'

export default function AddToCartButton(props: {
  id: string | number
  title: string
  priceCents: number
  imageUrl?: string
  producer?: string
}) {
  const { add } = useCart()
  const priceNum = props.priceCents / 100
  const priceFormatted = `€${priceNum.toFixed(2)}`

  return (
    <button
      className="h-9 px-3 rounded bg-neutral-900 text-white text-sm"
      onClick={() => add({
        id: String(props.id),
        title: props.title,
        priceFormatted,
        price: priceNum,
        currency: 'EUR',
        imageUrl: props.imageUrl,
        producer: props.producer
      }, 1)}
      aria-label={`Προσθήκη ${props.title} στο καλάθι`}
    >
      Προσθήκη
    </button>
  )
}
