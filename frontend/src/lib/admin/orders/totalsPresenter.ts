import { calcTotals, fmtEUR } from '@/lib/cart/totals'

type Line = { price?: number; qty?: number; quantity?: number }
type OrderLike = Record<string, any>

/** Προσπάθησε να εξάγεις lines/shipping από το αντικείμενο παραγγελίας, αλλιώς κάνε ασφαλείς προσεγγίσεις. */
export function computeDisplayTotals(order: OrderLike){
  const items: Line[] =
    Array.isArray(order?.items) ? order.items :
    Array.isArray(order?.lines) ? order.lines :
    Array.isArray(order?.orderItems) ? order.orderItems :
    []

  const shippingMethod: 'PICKUP'|'COURIER'|'COURIER_COD' =
    (order?.shippingMethod as any) || 'COURIER'

  const baseShipping =
    typeof order?.computedShipping === 'number' ? order.computedShipping :
    typeof order?.shippingCost === 'number' ? order.shippingCost :
    undefined

  const codFee =
    typeof order?.codFee === 'number' ? order.codFee : undefined

  const taxRate =
    typeof order?.taxRate === 'number' ? order.taxRate : undefined

  const normalized = items.map(x => ({ price: Number(x?.price||0), qty: Number(x?.qty||x?.quantity||1) }))
  const t = calcTotals({ items: normalized, shippingMethod, baseShipping, codFee, taxRate })
  return {
    ...t,
    fmt: {
      subtotal: fmtEUR(t.subtotal),
      shipping: fmtEUR(t.shipping),
      codFee: fmtEUR(t.codFee),
      tax: fmtEUR(t.tax),
      grandTotal: fmtEUR(t.grandTotal),
    }
  }
}
