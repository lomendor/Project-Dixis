import { test, expect } from '@playwright/test'

/**
 * AG119.1 E2E Smoke: Products page rendering from Neon DB
 *
 * Validates that /products page renders without console errors
 * and displays the expected heading. Card count is flexible
 * (depends on seeded data).
 */
test('products page renders without console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.goto('/products', { waitUntil: 'domcontentloaded' })

  // Verify main heading is visible
  await expect(page.getByRole('heading', { name: 'Προϊόντα', level: 1 })).toBeVisible()

  // Flexible card count - just ensure no errors occurred
  const cards = page.locator('main .grid > div')
  const count = await cards.count()
  console.log(`✓ Products page rendered with ${count} cards`)

  // Assert no console errors
  expect(errors, `Console errors on /products:\n${errors.join('\n')}`).toEqual([])
})
