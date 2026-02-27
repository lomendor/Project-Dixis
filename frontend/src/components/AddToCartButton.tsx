'use client'
import { useCart } from '@/lib/cart'
import { useState } from 'react'
import { useToast } from '@/contexts/ToastContext'
import { Plus, Check, Minus, Trash2 } from 'lucide-react'

/**
 * AddToCartButton — Commerce-first design (Wolt/Flink pattern)
 *
 * Two modes:
 * - compact: "+" icon → inline [- qty +] stepper when in cart
 * - default: Full "Στο Καλάθι" text → inline stepper when in cart
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
  const itemId = String(props.id)
  const add = useCart(s => s.add)
  const inc = useCart(s => s.inc)
  const dec = useCart(s => s.dec)
  const cartItem = useCart(s => s.items[itemId])
  const qty = cartItem?.qty ?? 0
  const [justAdded, setJustAdded] = useState(false)
  const { showSuccess } = useToast()

  const isOutOfStock = typeof props.stock === 'number' && props.stock <= 0

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) return

    add({
      id: itemId,
      title: props.title,
      priceCents: props.priceCents,
      imageUrl: props.imageUrl,
      producerId: props.producerId,
      producerName: props.producerName,
    })
    setJustAdded(true)
    showSuccess(`${props.title} προστέθηκε στο καλάθι`, 2000)
    setTimeout(() => setJustAdded(false), 600)
  }

  const handleInc = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    inc(itemId)
  }

  const handleDec = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dec(itemId)
  }

  // ── Compact mode (product cards) ──
  if (props.compact) {
    if (isOutOfStock) {
      return (
        <button
          className="w-10 h-10 rounded-lg bg-neutral-100 text-neutral-400 cursor-not-allowed flex items-center justify-center"
          disabled
          aria-label={`${props.title} - Εξαντλήθηκε`}
          data-testid="add-to-cart-button"
          data-oos="true"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      )
    }

    // In cart → show stepper [- qty +]
    if (qty > 0) {
      return (
        <div
          className="inline-flex items-center h-10 rounded-lg bg-primary overflow-hidden"
          aria-label={`${props.title} - ${qty} στο καλάθι`}
          data-testid="qty-stepper"
        >
          <button
            onClick={handleDec}
            className="w-9 h-10 flex items-center justify-center text-white hover:bg-primary-light transition-colors active:scale-90"
            aria-label={qty === 1 ? 'Αφαίρεση από καλάθι' : 'Μείωση ποσότητας'}
          >
            {qty === 1 ? <Trash2 className="w-4 h-4" strokeWidth={2.5} /> : <Minus className="w-4 h-4" strokeWidth={2.5} />}
          </button>
          <span className="w-7 text-center text-sm font-bold text-white tabular-nums">
            {qty}
          </span>
          <button
            onClick={handleInc}
            className="w-9 h-10 flex items-center justify-center text-white hover:bg-primary-light transition-colors active:scale-90"
            aria-label="Αύξηση ποσότητας"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      )
    }

    // Not in cart → show "+" button
    return (
      <button
        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-90 text-white ${
          justAdded
            ? 'bg-green-500'
            : 'bg-primary hover:bg-primary-light'
        }`}
        onClick={handleAdd}
        disabled={justAdded}
        aria-label={`Προσθήκη ${props.title} στο καλάθι`}
        aria-live="polite"
        data-testid="add-to-cart-button"
      >
        {justAdded ? <Check className="w-5 h-5" strokeWidth={2.5} /> : <Plus className="w-5 h-5" strokeWidth={2.5} />}
      </button>
    )
  }

  // ── Full mode (detail pages) ──
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

  // In cart → show stepper
  if (qty > 0) {
    return (
      <div
        className="inline-flex items-center h-11 rounded-lg bg-primary overflow-hidden"
        aria-label={`${props.title} - ${qty} στο καλάθι`}
        data-testid="qty-stepper"
      >
        <button
          onClick={handleDec}
          className="w-11 h-11 flex items-center justify-center text-white hover:bg-primary-light transition-colors active:scale-95"
          aria-label={qty === 1 ? 'Αφαίρεση από καλάθι' : 'Μείωση ποσότητας'}
        >
          {qty === 1 ? <Trash2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
        </button>
        <span className="w-10 text-center text-base font-bold text-white tabular-nums">
          {qty}
        </span>
        <button
          onClick={handleInc}
          className="w-11 h-11 flex items-center justify-center text-white hover:bg-primary-light transition-colors active:scale-95"
          aria-label="Αύξηση ποσότητας"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <button
      className={`h-11 px-5 w-full sm:w-auto rounded-lg text-sm font-semibold transition-all duration-200 active:scale-[0.97] text-white ${
        justAdded
          ? 'bg-green-500'
          : 'bg-primary hover:bg-primary-light'
      }`}
      onClick={handleAdd}
      disabled={justAdded}
      aria-label={`Προσθήκη ${props.title} στο καλάθι`}
      aria-live="polite"
      data-testid="add-to-cart-button"
    >
      {justAdded ? '✓ Προστέθηκε' : 'Στο Καλάθι'}
    </button>
  )
}
