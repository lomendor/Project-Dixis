import { test, expect } from '@playwright/test'
test('products: add button is present and clickable', async ({ page }) => {
  await page.goto('/products', { waitUntil: 'domcontentloaded' })
  const btn = page.getByRole('button', { name: /Προσθήκη/i })
  await expect(btn.first()).toBeVisible()
  await btn.first().click()
  // βασική επιβεβαίωση: παραμένουμε στη σελίδα
  await expect(page).toHaveURL(/\/products/)
})
