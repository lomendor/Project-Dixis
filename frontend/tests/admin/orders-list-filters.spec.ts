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

async function seedOrder(request:any, status:string, email:string){
  const prod = await request.post(base+'/api/me/products', { data:{ title:`Προϊόν ${status}`, category:'Δοκιμή', price:5, unit:'τεμ', stock:5, isActive:true }})
  const pid = (await prod.json()).item.id
  const ord = await request.post(base+'/api/checkout', { data:{ items:[{ productId: pid, qty:1 }], shipping:{ name:'Πελάτης', line1:'Οδός 1', city:'Αθήνα', postal:'11111', phone:'+306900000555', email }, payment:{ method:'COD' }}})
  const body = await ord.json(); const oid = body.orderId || body.id
  if (status !== 'PAID'){
    await request.post(`${base}/api/admin/orders/${oid}/status`, { data:{ status }})
  }
  return oid
}

test('orders list filters & search', async ({ page, request }) => {
  const oPaid = await seedOrder(request,'PAID','paid@example.com')
  const oPacking = await seedOrder(request,'PACKING','packing@example.com')
  const oShipped = await seedOrder(request,'SHIPPED','shipped@example.com')

  const cookie = await adminCookie()
  await page.context().addCookies([{ name:'dixis_session', value:cookie, url: base }])

  await page.goto(`${base}/admin/orders`)

  // Filter: PACKING
  await page.getByTestId('orders-status').selectOption('PACKING')
  await page.getByRole('button', { name: 'Εφαρμογή' }).click()
  await expect(page.locator('body')).toContainText(/Συσκευασία|PACKING/)

  // Filter: SHIPPED
  await page.getByTestId('orders-status').selectOption('SHIPPED')
  await page.getByRole('button', { name: 'Εφαρμογή' }).click()
  await expect(page.locator('body')).toContainText(/Απεστάλη|SHIPPED/)

  // Search by email
  await page.getByTestId('orders-q').fill('paid@example.com')
  await page.getByRole('button', { name: 'Εφαρμογή' }).click()
  await expect(page.locator('body')).toContainText(oPaid)
})
