import { test, expect } from '@playwright/test'

test('COD courier totals (EL)', async () => {
  // Import at runtime since we need Node.js resolution
  const { calcTotals, fmtEUR } = await import('../../src/lib/cart/totals')
  
  const t = calcTotals({ 
    items:[{price:10,qty:2},{price:5.5,qty:1}], 
    shippingMethod:'COURIER_COD', 
    baseShipping:3.5, 
    codFee:2.0, 
    taxRate:0 
  })
  
  expect(t.subtotal).toBeCloseTo(25.5, 2)
  expect(t.shipping).toBeCloseTo(3.5, 2)
  expect(t.codFee).toBeCloseTo(2.0, 2)
  expect(t.tax).toBeCloseTo(0, 2)
  expect(t.grandTotal).toBeCloseTo(31.0, 2)
  expect(fmtEUR(t.grandTotal)).toMatch(/31[,.]00/)
})

test('Pickup totals (no shipping)', async () => {
  const { calcTotals } = await import('../../src/lib/cart/totals')
  
  const t = calcTotals({ 
    items:[{price:4.2,qty:1}], 
    shippingMethod:'PICKUP', 
    taxRate:0 
  })
  
  expect(t.subtotal).toBeCloseTo(4.2, 2)
  expect(t.shipping).toBeCloseTo(0, 2)
  expect(t.codFee).toBeCloseTo(0, 2)
  expect(t.tax).toBeCloseTo(0, 2)
  expect(t.grandTotal).toBeCloseTo(4.2, 2)
})
