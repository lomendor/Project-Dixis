import { test, expect } from '@playwright/test';

test('cart adds, persists, and allows qty/remove', async ({ page }) => {
  // Go to products page
  await page.goto('/products', { waitUntil: 'domcontentloaded' });

  // Add 2 products (take first two "Προσθήκη" buttons)
  const addButtons = page.getByRole('button', { name: 'Προσθήκη' });
  const count = await addButtons.count();
  expect(count).toBeGreaterThan(0);

  await addButtons.nth(0).click();
  if (count > 1) {
    await addButtons.nth(1).click();
  }

  // Go to cart page
  await page.goto('/cart', { waitUntil: 'domcontentloaded' });

  // Verify cart has items displayed
  const cartRows = page.locator('main .lg\\:col-span-2 > div');
  await expect(cartRows.first()).toBeVisible();

  // Increase quantity on first item
  const plusButton = page.getByRole('button', { name: '+' }).first();
  await plusButton.click();

  // Remove first item
  const removeButton = page.getByRole('button', { name: 'Αφαίρεση' }).first();
  await removeButton.click();

  // Reload → verify persistence (localStorage)
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Υποσύνολο')).toBeVisible();
});
