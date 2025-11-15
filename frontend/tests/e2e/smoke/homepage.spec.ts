import { test, expect } from '@playwright/test'

test('homepage loads and shows header', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Dixis/i)
  await expect(page.locator('header')).toBeVisible()
  // basic content smoke
  await expect(page.locator('body')).toContainText(/Dixis/i)
})
