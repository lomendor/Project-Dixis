import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'https://dixis.io'

test('products: ProductCard grid renders with AddToCartButton', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' })

  // Check heading
  await expect(page.getByRole('heading', { name: /Προϊόντα/i })).toBeVisible()

  // Check grid exists
  const grid = page.locator('.grid')
  await expect(grid).toBeVisible()

  // Check for AddToCartButton (Προσθήκη text)
  const addButtons = page.locator('button:has-text("Προσθήκη")')
  const count = await addButtons.count()
  expect(count).toBeGreaterThan(0)

  // Verify no console errors
  expect(errors, `Console errors detected: ${errors.join('\n')}`).toEqual([])
})

test('products: no reload loop', async ({ page }) => {
  let navigations = 0
  page.on('framenavigated', () => { navigations++ })

  await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(6000)

  expect(navigations).toBeLessThan(3)
})
