import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';

test.describe('Cart & Checkout M0 (prod)', () => {
  test('add items → cart persists → checkout success', async ({ page }) => {
    // Products → add 2 items
    await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' });
    const addButtons = page.locator('[data-testid="add-to-cart-button"]');
    await expect(addButtons.first()).toBeVisible();
    await addButtons.nth(0).click();
    await addButtons.nth(1).click();

    // Badge should be >= 2
    const badge = page.locator('[data-testid="cart-item-count"]');
    await expect(badge).toBeVisible();
    const badgeText = await badge.innerText();
    const count = parseInt(badgeText.replace(/\D/g, ''), 10);
    expect(count).toBeGreaterThanOrEqual(2);

    // Go to cart and adjust quantities
    await page.goto(`${BASE}/cart`, { waitUntil: 'domcontentloaded' });
    const inc = page.locator('[data-testid="qty-plus"]').first();
    const dec = page.locator('[data-testid="qty-minus"]').first();
    await expect(inc).toBeVisible();
    await inc.click(); // +1 στο πρώτο item
    await expect(dec).toBeVisible();
    await dec.click(); // -1 στο πρώτο item (επιστροφή)

    // Proceed to checkout
    const goCheckout = page.locator('[data-testid="go-checkout"]');
    await expect(goCheckout).toBeVisible();
    await goCheckout.click();

    // Fill checkout form
    await expect(page).toHaveURL(new RegExp(`${BASE}/checkout`));
    await page.locator('[data-testid="checkout-name"]').fill('Test User');
    await page.locator('[data-testid="checkout-email"]').fill('test@example.com');
    await page.locator('[data-testid="checkout-address"]').fill('Somewhere 1');
    await page.locator('[data-testid="checkout-submit"]').click();

    // Success page with orderId
    await expect(page).toHaveURL(new RegExp(`${BASE}/checkout/success`));
    const content = await page.content();
    expect(content).toMatch(/ORD-/);

    // Cart should be cleared
    await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' });
    const badgeAfter = page.locator('[data-testid="cart-item-count"]');
    // Badge might be hidden or show 0 - check if it's not visible or shows 0
    const badgeCount = await badgeAfter.count();
    if (badgeCount > 0) {
      const badgeTextAfter = await badgeAfter.innerText();
      const countAfter = parseInt(badgeTextAfter.replace(/\D/g, ''), 10) || 0;
      expect(countAfter).toBe(0);
    }
  });
});
