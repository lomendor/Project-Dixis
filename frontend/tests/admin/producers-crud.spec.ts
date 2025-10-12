import { test, expect } from '@playwright/test'
const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001'
const adminPhone = (process.env.ADMIN_PHONES||'+306900000084').split(',')[0]
const bypass = process.env.OTP_BYPASS || '000000'

async function adminCookie(request:any){
  await request.post(base+'/api/auth/request-otp', { data:{ phone: adminPhone }})
  const vr = await request.post(base+'/api/auth/verify-otp', { data:{ phone: adminPhone, code: bypass }})
  return (await vr.headersArray()).find((h:any)=>h.name.toLowerCase()==='set-cookie')?.value?.split('dixis_session=')[1]?.split(';')[0] || ''
}

test('Admin Producers CRUD (API-first)', async ({ request }) => {
  const cookie = await adminCookie(request)

  // create
  const name = 'Παραγωγός ' + Math.random().toString(36).slice(2,7)
  const slug = 'prod-' + Math.random().toString(36).slice(2,7)
  const cr = await request.post(base+'/api/admin/producers', {
    headers:{ cookie:`dixis_session=${cookie}` },
    data:{
      name,
      slug,
      region:'Αττική',
      category:'Λάδι',
      email:'prod@example.com',
      phone:'+306912345678'
    }
  })
  expect([201]).toContain(cr.status())
  const cbody = await cr.json()
  const id = cbody.item.id

  // list
  const ls = await request.get(base+'/api/admin/producers', {
    headers:{ cookie:`dixis_session=${cookie}` }
  })
  expect(ls.status()).toBe(200)
  const ljson = await ls.json()
  expect((ljson.items||[]).find((x:any)=>x.id===id)).toBeTruthy()

  // toggle
  const tg = await request.patch(base+`/api/admin/producers/${id}`, {
    headers:{ cookie:`dixis_session=${cookie}` },
    data:{ toggleActive:true }
  })
  expect(tg.status()).toBe(200)
  const tgjson = await tg.json()
  expect(tgjson.item.isActive).toBe(false) // toggled from true to false
})
