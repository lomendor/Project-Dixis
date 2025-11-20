import CartBadge from '@/components/CartBadge'

async function getCart() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/cart`, { cache:'no-store' })
  if (!res.ok) return { items: [], totalCents: 0 }
  return res.json()
}

export default async function CartPage() {
  const data = await getCart()
  const items = data.items || []
  const total = (data.totalCents ?? 0) / 100
  const count = items.length

  return (
    <main className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold" data-testid="cart-title">
          Καλάθι {count > 0 ? `(${count})` : ''}
        </h1>
        {/* client badge for live updates */}
        <CartBadge />
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-neutral-600">Το καλάθι είναι άδειο.</div>
      ) : (
        <div className="space-y-3">
          {items.map((i:any) => (
            <div key={i.id} className="cart-row flex items-center justify-between border p-3 rounded">
              <div>
                <div className="font-medium">{i.title}</div>
                <div className="text-xs text-neutral-600">Ποσότητα: {i.qty}</div>
              </div>
              <div className="text-sm">{(i.priceCents/100).toFixed(2)} €</div>
            </div>
          ))}
          <div className="pt-2 text-right font-semibold">Σύνολο: {total.toFixed(2)} €</div>
        </div>
      )}
    </main>
  )
}
