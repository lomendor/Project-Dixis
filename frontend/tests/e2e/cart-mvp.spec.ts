import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000'

test.describe('Cart MVP', () => {
  test('add updates badge', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // 1) Go to /products
    await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: /Προϊόντα/i })).toBeVisible()

    // 2) Click first "Προσθήκη" button
    const addButton = page.getByTestId('add-to-cart-button').first()
    await expect(addButton).toBeVisible()
    await addButton.click()

    // Wait for animation and state update
    await page.waitForTimeout(1000)

    // 3) Badge should show "1"
    const badge = page.getByTestId('cart-item-count')
    await expect(badge).toBeVisible()
    const badgeText = await badge.innerText()
    expect(badgeText).toContain('1')

    // 4) No console errors
    expect(errors, `Console errors detected: ${errors.join(', ')}`).toEqual([])
  })

  test('qty plus/minus changes totals', async ({ page }) => {
    // 1) Go to /products and add 1 item
    await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: /Προϊόντα/i })).toBeVisible()

    const addButton = page.getByTestId('add-to-cart-button').first()
    await expect(addButton).toBeVisible()
    await addButton.click()
    await page.waitForTimeout(1000)

    // 2) Go to /cart and verify qty is initially 1
    await page.goto(`${BASE}/cart`, { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: /Καλάθι/i })).toBeVisible()

    // Get initial qty and subtotal
    const qtySpan = page.locator('span').filter({ hasText: /^\d+$/ }).first()
    await expect(qtySpan).toBeVisible()
    let qty = await qtySpan.innerText()
    expect(qty).toBe('1')

    // Get initial subtotal (find the price text)
    const subtotalElement = page.locator('text=/\\d+,\\d+\\s*€/').first()
    await expect(subtotalElement).toBeVisible()
    const initialSubtotal = await subtotalElement.innerText()

    // 3) Click "+" → qty should be 2, subtotal should increase
    const plusButton = page.getByTestId('qty-plus').first()
    await expect(plusButton).toBeVisible()
    await plusButton.click()
    await page.waitForTimeout(500)

    qty = await qtySpan.innerText()
    expect(qty).toBe('2')

    const increasedSubtotal = await subtotalElement.innerText()
    expect(increasedSubtotal).not.toBe(initialSubtotal)

    // 4) Click "-" → qty should be 1, subtotal should decrease
    const minusButton = page.getByTestId('qty-minus').first()
    await expect(minusButton).toBeVisible()
    await minusButton.click()
    await page.waitForTimeout(500)

    qty = await qtySpan.innerText()
    expect(qty).toBe('1')

    const decreasedSubtotal = await subtotalElement.innerText()
    expect(decreasedSubtotal).toBe(initialSubtotal)
  })
})
