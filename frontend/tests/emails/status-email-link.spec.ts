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

test('status email contains public tracking link (if dev mailbox available)', async ({ request }) => {
  // seed
  const cookie = await adminCookie()
  const prod = await request.post(base+'/api/me/products', { 
    headers:{ cookie:`dixis_session=${cookie}` },
    data:{ title:'Ελιές Θρούμπες', category:'Ελιές', price:5.2, unit:'τεμ', stock:5, isActive:true }
  })
  const pid = (await prod.json()).item.id
  const email='status-link@example.com'
  const ord = await request.post(base+'/api/checkout', { data:{ items:[{ productId: pid, qty:1 }], shipping:{ name:'Πελάτης', line1:'Οδός 1', city:'Αθήνα', postal:'11111', phone:'+306900000555', email }, payment:{ method:'COD' }}})
  const body = await ord.json(); const oid = body.orderId || body.id

  // αλλάζουμε status για να σταλεί email
  const res = await request.post(base+`/api/admin/orders/${oid}/status`, { 
    headers:{ cookie:`dixis_session=${cookie}` },
    data:{ status:'PACKING' }
  })
  expect([200,204]).toContain(res.status())

  // mailbox (αν υπάρχει)
  const inbox = await request.get(base+`/api/dev/mailbox?to=${email}`)
  if (inbox.status() \!== 200){ test.skip(true, 'dev mailbox not available'); return; }
  const j = await inbox.json()
  expect(j.item?.html || j.item?.text || '').toMatch(/\/track\//i)
})
