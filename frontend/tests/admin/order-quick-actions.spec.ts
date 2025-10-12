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

test('admin quick actions: PACKING → SHIPPED', async ({ page, request }) => {
  // 1) Seed product
  const prod = await request.post(base+'/api/me/products', {
    data:{ title:'Ελιές Θρούμπες', category:'Ελιές', price:5.2, unit:'τεμ', stock:5, isActive:true }
  })
  expect([200,201]).toContain(prod.status())
  const pid = (await prod.json()).item.id

  // 2) Checkout -> create order
  const ord = await request.post(base+'/api/checkout', { 
    data:{
      items:[{ productId: pid, qty:1 }],
      shipping:{ name:'Πελάτης', line1:'Οδός 1', city:'Αθήνα', postal:'11111', phone:'+306900000555', email:'qa@example.com' },
      payment:{ method:'COD' }
    }
  })
  expect([200,201]).toContain(ord.status())
  const body = await ord.json()
  const oid = body.orderId || body.id

  // 3) Admin login & open order page
  const cookie = await adminCookie()
  await page.context().addCookies([{ name:'dixis_session', value:cookie, url: base }])
  await page.goto(`${base}/admin/orders/${oid}`)

  // 4) Click PACKING → SHIPPED
  await page.getByTestId('qa-packing').click()
  await page.waitForTimeout(300)
  await page.getByTestId('qa-shipped').click()
  await page.waitForTimeout(300)

  // 5) UI reflects SHIPPED
  await expect(page.locator('body')).toContainText(/Απεστάλη|SHIPPED/i)
})
