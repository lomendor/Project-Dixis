import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000'

/**
 * AG119.2.1: Cart qty +/- controls E2E test
 * - Verifies inc/dec methods are properly wired
 * - Checks quantity updates and subtotal changes
 */
test.describe('Cart quantity controls', () => {
  test('plus/minus buttons update quantity and subtotal', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // 1) Add product from /products page
    await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: /Προϊόντα/i })).toBeVisible()

    const addButton = page.getByTestId('add-to-cart-button').first()
    await expect(addButton).toBeVisible()
    await addButton.click()
    await page.waitForTimeout(1000)

    // 2) Verify badge shows count of 1
    const badge = page.getByTestId('cart-item-count')
    await expect(badge).toBeVisible()
    let badgeText = await badge.innerText()
    expect(badgeText).toContain('1')

    // 3) Navigate to cart page
    await page.goto(`${BASE}/cart`, { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: /Καλάθι/i })).toBeVisible()

    // 4) Verify initial quantity is 1
    const qtySpan = page.getByTestId('qty').first()
    await expect(qtySpan).toBeVisible()
    let qty = await qtySpan.innerText()
    expect(qty).toBe('1')

    // Get initial subtotal
    const subtotalElement = page.locator('text=/\\d+,\\d+\\s*€/').first()
    await expect(subtotalElement).toBeVisible()
    const initialSubtotal = await subtotalElement.innerText()

    // 5) Click + button → qty should become 2
    const plusButton = page.getByTestId('qty-plus').first()
    await expect(plusButton).toBeVisible()
    await plusButton.click()
    await page.waitForTimeout(500)

    qty = await qtySpan.innerText()
    expect(qty).toBe('2')

    // Subtotal should increase
    const increasedSubtotal = await subtotalElement.innerText()
    expect(increasedSubtotal).not.toBe(initialSubtotal)

    // 6) Click - button → qty should return to 1
    const minusButton = page.getByTestId('qty-minus').first()
    await expect(minusButton).toBeVisible()
    await minusButton.click()
    await page.waitForTimeout(500)

    qty = await qtySpan.innerText()
    expect(qty).toBe('1')

    // Subtotal should decrease back to original
    const decreasedSubtotal = await subtotalElement.innerText()
    expect(decreasedSubtotal).toBe(initialSubtotal)

    // 7) Verify no console errors
    expect(errors, `Console errors detected: ${errors.join(', ')}`).toEqual([])
  })
})
