import { test, expect } from '@playwright/test';

test('Confirmation page shows orderId; /checkout/success redirects', async ({ page, request }) => {
  // Get products
  const list = await request.get('/api/products');
  const data = await list.json();
  const first = data?.items?.[0];
  test.skip(!first, 'No products');

  // Add one item through UI
  await page.goto('/products');
  await page.getByTestId('add-to-cart').first().click();

  // Go to checkout and fill form
  await page.goto('/checkout');
  await page.getByPlaceholder('Email *').fill('bot@example.com');
  await page.getByRole('button', { name: 'Καταχώριση παραγγελίας' }).click();

  // Should redirect to confirmation page with orderId
  await page.waitForURL(/\/checkout\/confirmation\?orderId=/);

  // Verify order-id testid is visible
  const id = await page.getByTestId('order-id').innerText();
  expect(id.length).toBeGreaterThan(3);

  // Test legacy success URL should 307 redirect to confirmation
  await page.goto(`/checkout/success?order=${id}`);
  await page.waitForURL(/\/checkout\/confirmation\?orderId=/);

  // Verify we can still see the order ID after redirect
  const idAfterRedirect = await page.getByTestId('order-id').innerText();
  expect(idAfterRedirect).toBe(id);
});
