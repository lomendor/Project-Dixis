import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000'

test.describe('Products UI — Stable Smoke', () => {
  test('renders grid and product cards without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })

    await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: 'Προϊόντα', level: 1 })).toBeVisible()

    const cards = page.locator('[data-testid="product-card"]')
    await expect(cards.first()).toBeVisible({ timeout: 10000 })
    await expect(cards).toHaveCountGreaterThan(0)

    await expect(page.locator('[data-testid="product-card-title"]').first()).toBeVisible()
    await expect(page.locator('[data-testid="product-card-price"]').first()).toBeVisible()
    await expect(page.locator('[data-testid="product-card-add"]').first()).toBeVisible()

    expect(errors, `Console errors on /products:\n${errors.join('\n')}`).toEqual([])
  })
})
