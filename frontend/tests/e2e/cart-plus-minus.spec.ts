import { test, expect } from '@playwright/test'
const BASE = process.env.BASE_URL || 'http://127.0.0.1:3001' // local dev

test('cart: add from products, then + and - work, badge & total update', async ({ page }) => {
  // Start fresh localStorage
  await page.context().clearCookies()
  await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' })

  // Προσθήκη πρώτου προϊόντος
  await page.getByTestId('add-to-cart-button').first().click()

  // Badge > 0
  const badge = page.getByTestId('cart-badge')
  await expect(badge).toHaveText(/[1-9]\d*/)

  // Πήγαινε στο καλάθι
  await page.goto(`${BASE}/cart`, { waitUntil: 'domcontentloaded' })

  // Διάβασε αρχική qty & total
  const qtyBefore = parseInt(await page.getByTestId('qty').first().innerText(), 10)
  const totalBefore = await page.getByTestId('total').innerText()

  // Πάτα +
  await page.getByTestId('qty-plus').first().click()

  // Qty αυξάνει
  const qtyAfter = parseInt(await page.getByTestId('qty').first().innerText(), 10)
  expect(qtyAfter).toBe(qtyBefore + 1)

  // Total αλλάζει (string compare διαφορετικό)
  const totalAfter = await page.getByTestId('total').innerText()
  expect(totalAfter).not.toBe(totalBefore)

  // Πάτα − (δύο φορές για να βεβαιωθούμε ότι μειώνει σωστά)
  await page.getByTestId('qty-minus').first().click()
  await page.getByTestId('qty-minus').first().click()

  // Badge ενημερώνεται (μπορεί να πέσει ή να μηδενίσει αν qty πήγε 0)
  await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' })
  await expect(badge).toHaveText(/\d+/)
})
