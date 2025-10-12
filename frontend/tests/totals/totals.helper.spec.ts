import { test, expect } from '@playwright/test'
import { calcTotals } from '@/lib/cart/totals'

test.describe('calcTotals helper', () => {
  test('calculates subtotal from items', () => {
    const result = calcTotals({
      items: [
        { price: 10.5, qty: 2 },
        { price: 5.25, qty: 3 }
      ]
    })
    expect(result.subtotal).toBe(36.75) // (10.5*2) + (5.25*3) = 21 + 15.75
  })

  test('PICKUP has zero shipping', () => {
    const result = calcTotals({
      items: [{ price: 10, qty: 1 }],
      shippingMethod: 'PICKUP'
    })
    expect(result.shipping).toBe(0)
    expect(result.codFee).toBe(0)
  })

  test('COURIER has default 3.5 shipping, no COD', () => {
    const result = calcTotals({
      items: [{ price: 10, qty: 1 }],
      shippingMethod: 'COURIER'
    })
    expect(result.shipping).toBe(3.5)
    expect(result.codFee).toBe(0)
  })

  test('COURIER_COD has default 3.5 shipping + 2.0 COD fee', () => {
    const result = calcTotals({
      items: [{ price: 10, qty: 1 }],
      shippingMethod: 'COURIER_COD'
    })
    expect(result.shipping).toBe(3.5)
    expect(result.codFee).toBe(2.0)
  })

  test('calculates tax based on subtotal', () => {
    const result = calcTotals({
      items: [{ price: 100, qty: 1 }],
      shippingMethod: 'PICKUP',
      taxRate: 0.24
    })
    expect(result.tax).toBe(24) // 100 * 0.24
  })

  test('grandTotal = subtotal + shipping + codFee + tax', () => {
    const result = calcTotals({
      items: [{ price: 100, qty: 1 }],
      shippingMethod: 'COURIER_COD',
      baseShipping: 3.5,
      codFee: 2.0,
      taxRate: 0.24
    })
    expect(result.subtotal).toBe(100)
    expect(result.shipping).toBe(3.5)
    expect(result.codFee).toBe(2.0)
    expect(result.tax).toBe(24)
    expect(result.grandTotal).toBe(129.5) // 100 + 3.5 + 2.0 + 24
  })

  test('rounds to 2 decimals', () => {
    const result = calcTotals({
      items: [{ price: 10.333, qty: 3 }], // 30.999
      shippingMethod: 'PICKUP'
    })
    expect(result.subtotal).toBe(31.00) // rounded
    expect(result.grandTotal).toBe(31.00)
  })
})
