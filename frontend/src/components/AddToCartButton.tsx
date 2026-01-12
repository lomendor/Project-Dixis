'use client'
import { useCart, AddResult } from '@/lib/cart'
import { useState } from 'react'
import ProducerConflictModal from './cart/ProducerConflictModal'

export default function AddToCartButton(props: {
  id: string | number
  title: string
  priceCents: number
  imageUrl?: string
  producerId?: string
  producerName?: string
}) {
  const add = useCart(s => s.add)
  const forceAdd = useCart(s => s.forceAdd)
  const [isAdded, setIsAdded] = useState(false)
  const [conflict, setConflict] = useState<Extract<AddResult, { status: 'conflict' }> | null>(null)
  const [pendingItem, setPendingItem] = useState<{id: string; title: string; priceCents: number; imageUrl?: string; producerId?: string; producerName?: string} | null>(null)

  const handleClick = () => {
    const item = {
      id: String(props.id),
      title: props.title,
      priceCents: props.priceCents,
      imageUrl: props.imageUrl,
      producerId: props.producerId,
      producerName: props.producerName,
    }

    const result = add(item)
    if (result.status === 'conflict') {
      setPendingItem(item)
      setConflict(result)
      return
    }

    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 900)
  }

  const handleReplaceCart = () => {
    if (pendingItem) {
      forceAdd(pendingItem)
      setIsAdded(true)
      setTimeout(() => setIsAdded(false), 900)
    }
    setConflict(null)
    setPendingItem(null)
  }

  const handleCancel = () => {
    setConflict(null)
    setPendingItem(null)
  }

  return (
    <>
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
      {conflict && (
        <ProducerConflictModal
          currentProducerName={conflict.currentProducerName}
          onCheckout={() => { window.location.href = '/checkout'; }}
          onReplace={handleReplaceCart}
          onCancel={handleCancel}
        />
      )}
    </>
  )
}
