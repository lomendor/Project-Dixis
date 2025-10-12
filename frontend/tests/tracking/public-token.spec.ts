import { test, expect, request as pwRequest } from '@playwright/test'

const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001'

test('public tracking: create order → fetch via token → page shows details', async ({ request }) => {
  // 1) Seed product via dev endpoint (producer-aware)
  const seed = await request.post(`${base}/api/dev/seed-producer-product`, {
    data:{
      title:'Λάδι Ελιάς Test',
      category:'Έλαια',
      price:8.9,
      unit:'τεμ',
      stock:10
    }
  })
  expect([200,201]).toContain(seed.status())
  const pid = (await seed.json()).item.id

  // 2) Create order via checkout
  const ord = await request.post(`${base}/api/checkout`, { 
    data:{
      items:[{ productId: pid, qty:2 }],
      shipping:{ 
        name:'Πελάτης Test', 
        line1:'Οδός 1', 
        city:'Αθήνα', 
        postal:'11111', 
        phone:'+306900000000', 
        email:'track@test.com' 
      },
      payment:{ method:'COD' }
    }
  })
  expect([200,201]).toContain(ord.status())
  const body = await ord.json()
  const orderId = body.orderId || body.id
  expect(orderId).toBeTruthy()

  // 3) Get public token (dev helper)
  const tokRes = await request.get(`${base}/api/dev/order-token?id=${encodeURIComponent(orderId)}`)
  expect(tokRes.status()).toBe(200)
  const tok = (await tokRes.json()).token
  expect(tok).toBeTruthy()

  // 4) Public API test
  const pub = await request.get(`${base}/api/orders/public/${encodeURIComponent(tok)}`)
  expect(pub.status()).toBe(200)
  const item = (await pub.json()).item
  expect(item.items.length).toBeGreaterThan(0)
  expect(item.totals.grandTotal).toBeGreaterThan(0)
  expect(item.items[0].title).toContain('Λάδι')

  // 5) Public page SSR test
  const pageCtx = await pwRequest.newContext()
  const pageRes = await pageCtx.get(`${base}/track/${encodeURIComponent(tok)}`)
  expect(pageRes.status()).toBe(200)
  const html = await pageRes.text()
  expect(html).toMatch(/Παρακολούθηση Παραγγελίας/)
  expect(html).toMatch(/Λάδι/)
  expect(html).toMatch(/Πληρωτέο/)
})
