import { test, expect } from '@playwright/test'

test('product detail renders (id=1 fallback)', async ({ page }) => {
  // adjust if your first product differs
  await page.goto('/products/1')
  await expect(page.locator('main')).toBeVisible()
  await expect(page).toHaveTitle(/Product|Προϊόν/i)
})
