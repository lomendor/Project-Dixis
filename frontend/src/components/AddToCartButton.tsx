'use client'
import { useState } from 'react'

export default function AddToCartButton(props: { id:string; title:string; priceCents:number }) {
  const [busy, setBusy] = useState(false)
  const [ok, setOk] = useState<null|boolean>(null)
  async function add() {
    setBusy(true); setOk(null)
    try {
      const res = await fetch('/api/cart', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify(props)
      })
      setOk(res.ok)
      window.dispatchEvent(new CustomEvent('cart:updated'))
    } catch { setOk(false) }
    setBusy(false)
  }
  return (
    <div className="flex items-center gap-2">
      <button disabled={busy} onClick={add} className="h-9 px-3 rounded bg-neutral-900 text-white text-sm">
        {busy ? '...' : 'Προσθήκη'}
      </button>
      {ok === true && <span className="text-xs text-green-700">✓</span>}
      {ok === false && <span className="text-xs text-red-700">✗</span>}
    </div>
  )
}
