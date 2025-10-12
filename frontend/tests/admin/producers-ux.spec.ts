import { test, expect } from '@playwright/test'
const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001'
const adminPhone = (process.env.ADMIN_PHONES||'+306900000084').split(',')[0]
const bypass = process.env.OTP_BYPASS || '000000'

async function adminCookie(request:any){
  await request.post(base+'/api/auth/request-otp', { data:{ phone: adminPhone }})
  const vr = await request.post(base+'/api/auth/verify-otp', { data:{ phone: adminPhone, code: bypass }})
  return (await vr.headersArray()).find((h:any)=>h.name.toLowerCase()==='set-cookie')?.value?.split('dixis_session=')[1]?.split(';')[0] || ''
}

// Helper: seed via API
async function createProducer(request:any, cookie:string, name:string, region='Αττική', category='Είδη τροφίμων', isActive=true){
  const slug = name.toLowerCase().replace(/\s+/g, '-')
  const res = await request.post(base + '/api/admin/producers', {
    headers:{ cookie:`dixis_session=${cookie}` },
    data:{ name, slug, region, category, isActive }
  })
  expect([200,201]).toContain(res.status())
  return await res.json()
}

test('Admin producers: search / filter / sort works', async ({ request, page }) => {
  const cookie = await adminCookie(request)
  const ts = Date.now()

  // Seed 3 producers with different names
  await createProducer(request, cookie, `Α-Ελιές ${ts}`, 'Χαλκιδική', 'Ελιές', true)
  await createProducer(request, cookie, `Μ-Μέλι ${ts}`, 'Εύβοια', 'Μέλι', true)
  await createProducer(request, cookie, `Ω-Οίνος ${ts}`, 'Νεμέα', 'Κρασί', false)

  // Test 1: Search with q filter (should show only Ελιές)
  await page.goto(`/admin/producers?q=${encodeURIComponent('Ελιές')}&active=only&sort=name-asc`)
  await expect(page.getByText('Παραγωγοί')).toBeVisible()

  // Should see only "Α-Ελιές"
  await expect(page.getByText(`Α-Ελιές ${ts}`)).toBeVisible()
  await expect(page.getByText(`Μ-Μέλι ${ts}`)).not.toBeVisible({ timeout: 500 })

  // Test 2: Sort descending (clear search, show all)
  await page.goto(`/admin/producers?sort=name-desc`)

  // Wait for table to load
  const rows = page.locator('tbody tr')
  await expect(rows.first()).toBeVisible()

  // Desc → "Ω-Οίνος" should be first
  await expect(rows.first()).toContainText(`Ω-Οίνος ${ts}`)

  // Test 3: Filter only active
  await page.goto(`/admin/producers?active=only`)

  // Should see "Α-Ελιές" and "Μ-Μέλι" but not "Ω-Οίνος" (inactive)
  await expect(page.getByText(`Α-Ελιές ${ts}`)).toBeVisible()
  await expect(page.getByText(`Μ-Μέλι ${ts}`)).toBeVisible()
  await expect(page.getByText(`Ω-Οίνος ${ts}`)).not.toBeVisible({ timeout: 500 })
})
