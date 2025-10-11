import { test, expect } from '@playwright/test'
const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001'

test('track index renders', async ({ page }) => {
  await page.goto(base + '/track')
  await expect(page.getByRole('heading', { name: 'Παρακολούθηση παραγγελίας' })).toBeVisible()
})

test('public API invalid token returns 404/400', async ({ request }) => {
  const r = await request.get(base + '/api/public/track/__invalid__token__')
  expect([400,404]).toContain(r.status())
})
