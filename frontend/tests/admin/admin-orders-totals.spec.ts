import { test, expect, request as pwRequest } from '@playwright/test'
const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001'
const adminPhone = (process.env.ADMIN_PHONES||'+306900000084').split(',')[0]
const bypass = process.env.OTP_BYPASS || '000000'

async function adminCookie(){
  const ctx = await pwRequest.newContext()
  await ctx.post(base+'/api/auth/request-otp', { data:{ phone: adminPhone }})
  const vr = await ctx.post(base+'/api/auth/verify-otp', { data:{ phone: adminPhone, code: bypass }})
  return (await vr.headersArray()).find(h=>h.name.toLowerCase()==='set-cookie')?.value?.split('dixis_session=')[1]?.split(';')[0] || ''
}

test('admin GET /api/admin/orders/:id returns totals', async ({ request }) => {
  const cookie = await adminCookie()
  
  // seed product
  const prod = await request.post(base+'/api/me/products', {
    headers:{ cookie:`dixis_session=${cookie}` },
    data:{ title:'Λάδι Εξαιρετικό', category:'Λάδι', price:7, unit:'τεμ', stock:10, isActive:true }
  })
  expect([200,201]).toContain(prod.status());
  const pid = (await prod.json()).item.id;

  // place order
  const email='admin-totals@example.com'
  const ord = await request.post(base+'/api/checkout', {
    data:{
      items:[{ productId: pid, qty:2 }],
      shipping:{ method:'COURIER', name:'Πελάτης', phone:'+306900000999', city:'Αθήνα', line1:'Οδός 1', postal:'11111', email },
      payment:{ method:'COD' }
    }
  })
  expect([200,201]).toContain(ord.status());
  const body = await ord.json(); 
  const oid = body.orderId || body.id

  // admin GET
  const res = await request.get(base+`/api/admin/orders/${oid}`, { 
    headers:{ cookie:`dixis_session=${cookie}` }
  })
  expect([200]).toContain(res.status());
  const json = await res.json()
  
  // verify totals exist and have valid values
  expect(json.totals).toBeTruthy()
  expect(json.totals.subtotal).toBeGreaterThan(0)
  expect(json.totals.grandTotal).toBeGreaterThan(0)
})
