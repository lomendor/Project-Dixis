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

test('POST /api/checkout returns totals object', async ({ request }) => {
  const cookie = await adminCookie()
  
  // Seed product
  const prod = await request.post(base+'/api/me/products', { 
    headers:{ cookie:`dixis_session=${cookie}` },
    data:{ title:'Ελιές Καλαμών', category:'Ελιές', price:12.50, unit:'κιλό', stock:10, isActive:true }
  })
  const pid = (await prod.json()).item.id

  // Checkout with COURIER_COD
  const res = await request.post(base+'/api/checkout', {
    data:{
      items:[{ productId: pid, qty: 2 }],
      shipping:{ 
        method:'COURIER_COD',
        name:'Πελάτης Τεστ', 
        line1:'Οδός 1', 
        city:'Αθήνα', 
        postal:'11111', 
        phone:'+306900000777',
        email:'totals@example.com'
      },
      payment:{ method:'COD' }
    }
  })

  expect(res.status()).toBe(201)
  const body = await res.json()
  
  // Verify totals object exists
  expect(body.totals).toBeDefined()
  expect(body.totals.subtotal).toBe(25) // 12.50 * 2
  expect(body.totals.shipping).toBe(3.5) // default COURIER
  expect(body.totals.codFee).toBe(2.0) // COURIER_COD fee
  expect(body.totals.tax).toBe(0) // no tax for now
  expect(body.totals.grandTotal).toBe(30.5) // 25 + 3.5 + 2.0
})

test('POST /api/checkout with PICKUP has zero shipping', async ({ request }) => {
  const cookie = await adminCookie()
  
  const prod = await request.post(base+'/api/me/products', { 
    headers:{ cookie:`dixis_session=${cookie}` },
    data:{ title:'Μέλι Θυμάρι', category:'Μέλι', price:8.00, unit:'βάζο', stock:5, isActive:true }
  })
  const pid = (await prod.json()).item.id

  const res = await request.post(base+'/api/checkout', {
    data:{
      items:[{ productId: pid, qty: 1 }],
      shipping:{ 
        method:'PICKUP',
        name:'Παραλήπτης', 
        line1:'Οδός 2', 
        city:'Πάτρα', 
        postal:'22222', 
        phone:'+306900000888'
      },
      payment:{ method:'CASH' }
    }
  })

  expect(res.status()).toBe(201)
  const body = await res.json()
  
  expect(body.totals.subtotal).toBe(8.00)
  expect(body.totals.shipping).toBe(0) // PICKUP
  expect(body.totals.codFee).toBe(0) // no COD
  expect(body.totals.grandTotal).toBe(8.00)
})
