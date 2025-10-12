import { test, expect, request as pwRequest } from '@playwright/test'
const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001'
const bypass = process.env.OTP_BYPASS || '000000'
const adminPhone = (process.env.ADMIN_PHONES||'+306900000084').split(',')[0]

async function adminCookie(){
  const ctx = await pwRequest.newContext()
  await ctx.post(base+'/api/auth/request-otp', { data: { phone: adminPhone }})
  const vr = await ctx.post(base+'/api/auth/verify-otp', { data:{ phone: adminPhone, code: bypass }})
  return (await vr.headersArray()).find(h=>h.name.toLowerCase()==='set-cookie')?.value?.split('dixis_session=')[1]?.split(';')[0] || ''
}

async function seedOrder(request:any){
  const prod = await request.post(base+'/api/me/products', { data:{ title:'Ελιές Θρούμπες', category:'Ελιές', price:5.2, unit:'τεμ', stock:5, isActive:true }})
  const pid = (await prod.json()).item.id
  const ord = await request.post(base+'/api/checkout', { data:{ items:[{ productId: pid, qty:1 }], shipping:{ name:'Πελάτης', line1:'Οδός 1', city:'Αθήνα', postal:'11111', phone:'+306900000555', email:'qa@example.com' }, payment:{ method:'COD' }}})
  const body = await ord.json()
  const oid = body.orderId || body.id

  // Get token via dev helper
  const tokenRes = await request.get(base+'/api/dev/track/token?orderId='+oid)
  const { token } = await tokenRes.json()
  return { id: oid, token }
}

test('public tracking page shows order status', async ({ page, request }) => {
  const cookie = await adminCookie()
  await page.context().addCookies([{ name:'dixis_session', value:cookie, url: base }])

  const { id, token } = await seedOrder(request)
  await page.goto(`${base}/track/${token}`)

  await expect(page.locator('body')).toContainText('Παρακολούθηση Παραγγελίας')
  await expect(page.locator('body')).toContainText(`#${id}`)
  await expect(page.locator('body')).toContainText(/Πληρωμή|PAID/i)
})
