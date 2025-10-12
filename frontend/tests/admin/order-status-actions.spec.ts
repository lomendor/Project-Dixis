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
  return body.orderId || body.id
}

test('quick actions: PACKING → SHIPPED → DELIVERED (cancel locked after delivered)', async ({ page, request }) => {
  const oid = await seedOrder(request)
  const cookie = await adminCookie()
  await page.context().addCookies([{ name:'dixis_session', value:cookie, url: base }])
  await page.goto(`${base}/admin/orders/${oid}`)

  await page.getByTestId('qa-packing').click()
  await page.waitForTimeout(300)
  await expect(page.locator('body')).toContainText(/Συσκευασία|PACKING/)

  await page.getByTestId('qa-shipped').click()
  await page.waitForTimeout(300)
  await expect(page.locator('body')).toContainText(/Απεστάλη|SHIPPED/)

  await page.getByTestId('qa-delivered').click()
  await page.waitForTimeout(300)
  await expect(page.locator('body')).toContainText(/Παραδόθηκε|DELIVERED/)

  // Try cancel after delivered (button should be disabled)
  const disabled = await page.getByTestId('qa-cancelled').isDisabled()
  expect(disabled).toBeTruthy()
})
