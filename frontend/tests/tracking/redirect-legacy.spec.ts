import { test, expect } from '@playwright/test'
const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001'

test('legacy /orders/track/[token] redirects to /track/[token]', async ({ page }) => {
  const tok = '__demo_token__'
  await page.goto(`${base}/orders/track/${tok}`)
  // Next.js redirect ends up on /track/[token]
  expect(page.url()).toContain(`/track/${tok}`)
  await expect(page.getByRole('heading', { name: 'Παρακολούθηση παραγγελίας' })).toBeVisible()
})
