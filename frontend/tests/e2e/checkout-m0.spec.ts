import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000'

test('checkout M0: happy path from cart to success', async ({ page }) => {
  // Start fresh
  await page.context().clearCookies()
  await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' })

  // Add a product to cart
  await page.getByTestId('add-to-cart-button').first().click()

  // Go to cart
  await page.goto(`${BASE}/cart`, { waitUntil: 'domcontentloaded' })

  // Verify cart has items
  await expect(page.getByTestId('qty').first()).toBeVisible()

  // Click checkout link
  await page.click('a[href="/checkout"]')

  // Should be on checkout page
  await expect(page.getByTestId('checkout-page')).toBeVisible()

  // Fill in the form
  await page.getByTestId('checkout-name').fill('Test User')
  await page.getByTestId('checkout-email').fill('test@example.com')
  await page.getByTestId('checkout-address').fill('123 Test St')

  // Submit the form
  await page.getByTestId('checkout-submit').click()

  // Should redirect to success page
  await expect(page.getByTestId('success-page')).toBeVisible({ timeout: 10000 })

  // Should show order ID
  await expect(page.getByTestId('order-id')).toContainText('ORD-')
})
