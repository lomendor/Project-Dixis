import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000'

test('/products page renders without errors', async ({ page }) => {
  await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' })

  // Wait for main content to load
  await page.waitForSelector('main', { timeout: 10000 })

  // Verify page title is visible
  await expect(page.getByRole('heading', { name: /προϊόντα/i })).toBeVisible()

  // Verify no infinite reload loops (wait 5s and check navigation count)
  let navigationCount = 0
  page.on('framenavigated', () => { navigationCount++ })
  await page.waitForTimeout(5000)
  expect(navigationCount).toBeLessThan(3)
})
