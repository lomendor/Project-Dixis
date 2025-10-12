export type Money = number
export function round2(n:number){ return Math.round((n + Number.EPSILON) * 100) / 100 }
export function fmtEUR(n:number){ return new Intl.NumberFormat('el-GR',{style:'currency',currency:'EUR'}).format(Number(n||0)) }

export type ShippingMethod = 'PICKUP'|'COURIER'|'COURIER_COD'
export interface TotalsInput {
  items: { price: number; qty: number }[]
  shippingMethod: ShippingMethod
  baseShipping?: number    // default: 3.5 εκτός PICKUP
  codFee?: number          // default: 2.0 μόνο για COURIER_COD
  taxRate?: number         // default: 0 (αν δεν έχουμε ΦΠΑ ακόμη)
}
export interface Totals {
  subtotal: Money
  shipping: Money
  codFee: Money
  tax: Money
  grandTotal: Money
}

export function calcTotals(i: TotalsInput): Totals {
  const subtotal = round2((i.items||[]).reduce((s,x)=> s + Number(x.price||0)*Number(x.qty||0), 0))
  const shipBase = Number(i.baseShipping ?? (i.shippingMethod==='PICKUP' ? 0 : 3.5))
  const cod = Number(i.shippingMethod==='COURIER_COD' ? (i.codFee ?? 2.0) : 0)
  const shipping = round2(shipBase)
  const codFee = round2(cod)
  const taxRate = Number(i.taxRate ?? 0)
  const tax = round2(subtotal * taxRate)
  const grandTotal = round2(subtotal + shipping + codFee + tax)
  return { subtotal, shipping, codFee, tax, grandTotal }
}

export function shippingLabel(m: ShippingMethod){
  const map: Record<ShippingMethod,string> = {
    PICKUP:'Παραλαβή από το κατάστημα',
    COURIER:'Κούριερ',
    COURIER_COD:'Κούριερ με αντικαταβολή'
  }
  return map[m] || String(m)
}
