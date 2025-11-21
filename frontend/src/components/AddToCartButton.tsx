'use client'
import { useState } from 'react'
import { useCart } from '@/components/cart/CartContext'

export default function AddToCartButton(props: { id:string; title:string; priceCents:number }) {
  const [ok, setOk] = useState<null|boolean>(null)
  const { add: addToCart } = useCart()

  function add() {
    try {
      const price = typeof props.priceCents === 'number' ? (props.priceCents / 100).toFixed(2) + '€' : '—'
      addToCart({
        id: props.id,
        title: props.title,
        price,
        imageUrl: undefined
      })
      setOk(true)
      window.dispatchEvent(new CustomEvent('cart:updated'))
      setTimeout(() => setOk(null), 2000)
    } catch {
      setOk(false)
      setTimeout(() => setOk(null), 2000)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={add} className="h-9 px-3 rounded bg-neutral-900 text-white text-sm">
        Προσθήκη
      </button>
      {ok === true && <span className="text-xs text-green-700">✓</span>}
      {ok === false && <span className="text-xs text-red-700">✗</span>}
    </div>
  )
}
