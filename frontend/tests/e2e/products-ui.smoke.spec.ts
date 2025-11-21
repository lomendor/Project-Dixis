import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'https://dixis.io'

test.skip('flaky: products page renders grid', async ({ page }) => {
  await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Προϊόντα' })).toBeVisible()

  // should render at least one card when demo/mock present
  const cards = page.locator('main .grid > div')
  await expect(cards.first()).toBeVisible()
})
