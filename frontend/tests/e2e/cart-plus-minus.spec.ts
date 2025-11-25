import { test, expect } from '@playwright/test'
const BASE = process.env.BASE_URL || 'http://127.0.0.1:3001' // local dev

test.describe('Cart +/- buttons (AG119.2)', () => {
  test('add from products, then + and - work, badge & total update', async ({ page }) => {
    // Clear localStorage and cookies for fresh start
    await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' })
    await page.evaluate(() => localStorage.clear())
    await page.context().clearCookies()
    await page.reload({ waitUntil: 'domcontentloaded' })

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 })

    // Προσθήκη πρώτου προϊόντος
    await page.getByTestId('add-to-cart-button').first().click()

    // Wait a moment for state to update
    await page.waitForTimeout(500)

    // Debug: Check localStorage after adding item (Zustand key is 'dixis:cart:v1')
    const storageAfterAdd = await page.evaluate(() => localStorage.getItem('dixis:cart:v1'))
    console.log('LocalStorage after add:', storageAfterAdd)

    // Badge auto-updates with Zustand (no reload needed)
    const badge = page.getByTestId('cart-badge')
    await expect(badge).toBeVisible({ timeout: 5000 })

    // Πήγαινε στο καλάθι
    await page.goto(`${BASE}/cart`, { waitUntil: 'networkidle' })

    // Debug: Check localStorage after navigation
    const storageAtCart = await page.evaluate(() => localStorage.getItem('dixis:cart:v1'))
    console.log('LocalStorage at cart:', storageAtCart)

    // Wait for cart to hydrate - Zustand needs time to load from localStorage
    // The page.tsx renders from Zustand state which loads from localStorage on hydration
    await page.waitForSelector('[data-testid="qty"]', { timeout: 15000 })

    // Διάβασε αρχική qty (page.tsx uses 'qty' testid)
    const qtyValue = page.getByTestId('qty').first()
    await expect(qtyValue).toBeVisible()
    const qtyBefore = parseInt(await qtyValue.innerText(), 10)
    expect(qtyBefore).toBe(1)

    // Διάβασε total (page.tsx uses 'total' testid)
    const totalBefore = await page.getByTestId('total').innerText()

    // Πάτα + (increment)
    await page.getByTestId('qty-plus').first().click()
    await page.waitForTimeout(300) // Wait for state update

    // Qty αυξάνει κατά 1
    await expect(qtyValue).toHaveText('2')

    // Total αλλάζει (string compare διαφορετικό)
    const totalAfter = await page.getByTestId('total').innerText()
    expect(totalAfter).not.toBe(totalBefore)

    // Πάτα − (decrement)
    await page.getByTestId('qty-minus').first().click()
    await page.waitForTimeout(300)

    // Qty μειώνεται πίσω στο 1
    await expect(qtyValue).toHaveText('1')
  })

  test('minus button removes item when qty is 1', async ({ page }) => {
    // Clear localStorage and cookies for fresh start
    await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' })
    await page.evaluate(() => localStorage.clear())
    await page.context().clearCookies()
    await page.reload({ waitUntil: 'domcontentloaded' })

    // Wait for products
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 })

    // Add product
    await page.getByTestId('add-to-cart-button').first().click()
    await page.waitForTimeout(500)

    // Go to cart
    await page.goto(`${BASE}/cart`, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="qty"]', { timeout: 15000 })

    // Verify qty is 1 (page.tsx uses 'qty' testid)
    await expect(page.getByTestId('qty').first()).toHaveText('1')

    // Click minus - should remove item (since qty=1)
    await page.getByTestId('qty-minus').first().click()
    await page.waitForTimeout(500)

    // Cart should now be empty
    await expect(page.getByTestId('empty-cart')).toBeVisible({ timeout: 5000 })
  })

  test('badge updates correctly with cart changes', async ({ page }) => {
    // Clear localStorage and cookies for fresh start
    await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' })
    await page.evaluate(() => localStorage.clear())
    await page.context().clearCookies()
    await page.reload({ waitUntil: 'domcontentloaded' })

    // Wait for products
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 })

    // Add first product
    await page.getByTestId('add-to-cart-button').first().click()
    await page.waitForTimeout(500)

    // Badge should show 1 (auto-updates with @/store/cart context)
    const badge = page.getByTestId('cart-badge')
    await expect(badge).toContainText('1', { timeout: 5000 })

    // Add same product again
    await page.getByTestId('add-to-cart-button').first().click()
    await page.waitForTimeout(500)

    // Badge should show 2
    await expect(badge).toContainText('2', { timeout: 5000 })
  })
})
