import { test, expect } from '@playwright/test'
const base = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000'

test('no hydration warning on home & has EL title', async ({ page })=>{
  const messages:string[] = []
  page.on('console', m => { if(m.type()==='error' || m.type()==='warning') messages.push(m.text()) })
  await page.goto(base+'/')
  await expect(page.locator('h1')).toContainText(/Dixis|Δixis|Καλώς/i)
  const hydra = messages.filter(x => /hydration/i.test(x))
  expect(hydra).toHaveLength(0)
})

test('/api/public/products returns JSON', async ({ request })=>{
  const res = await request.get(base+'/api/public/products?per_page=1')
  expect(res.status()).toBeLessThan(400)
  const j = await res.json()
  expect(j).toBeTruthy()
})
