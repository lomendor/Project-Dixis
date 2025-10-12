import { test, expect } from '@playwright/test'

test('orderStatus renders order summary (html+text)', async () => {
  const mod = await import('../../src/lib/mail/templates/orderStatus.ts')

  const items = [
    { title: 'Ελιές Θρούμπες', qty: 2, price: 5.5 },
    { title: 'Λάδι 1L', qty: 1, price: 7.2 }
  ]

  const totals = {
    subtotal: 18.2,
    shipping: 3.5,
    codFee: 0,
    tax: 0,
    grandTotal: 21.7
  }

  // Test HTML version
  const html = mod.html({
    id: 'DIX123',
    status: 'PAID',
    publicToken: 'TOK',
    items,
    totals
  } as any)

  expect(html).toMatch(/Σύνοψη παραγγελίας/)
  expect(html).toMatch(/Ελιές Θρούμπες/)
  expect(html).toMatch(/Λάδι 1L/)
  expect(html).toContain('Υποσύνολο:')
  expect(html).toContain('Σύνολο:')

  // Test text version
  const text = mod.text({
    id: 'DIX123',
    status: 'PAID',
    publicToken: 'TOK',
    items,
    totals
  } as any)

  expect(text).toMatch(/Σύνοψη παραγγελίας/)
  expect(text).toMatch(/Ελιές Θρούμπες/)
  expect(text).toMatch(/Υποσύνολο:/)
  expect(text).toMatch(/Σύνολο:/)
})
