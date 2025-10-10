import { test, expect } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001';

test('Order confirmation page shows correct details after checkout', async ({ page }) => {
  // Setup: Add items to cart
  await page.addInitScript(() => {
    window.localStorage.setItem('dixis_cart_v1', JSON.stringify({
      items: [
        { productId: 'prod-001', title: 'Τεστ Προϊόν', price: 15.5, qty: 2 }
      ]
    }));
  });

  await page.goto(base + '/checkout');
  await page.waitForLoadState('networkidle');

  // Fill shipping form
  await page.fill('input[name="name"]', 'Γιάννης Παπαδόπουλος');
  await page.fill('input[name="line1"]', 'Ακαδημίας 123');
  await page.fill('input[name="city"]', 'Αθήνα');
  await page.fill('input[name="postal"]', '10678');
  await page.fill('input[name="phone"]', '+306912345678');
  await page.fill('input[name="email"]', 'test@example.gr');

  // Submit checkout (intercept to capture orderId)
  const responsePromise = page.waitForResponse(resp =>
    resp.url().includes('/api/checkout') && resp.status() === 201
  );

  await page.click('button[type="submit"]');

  const response = await responsePromise;
  const json = await response.json();

  expect(json.success).toBe(true);
  expect(json.orderId).toBeTruthy();

  // Wait for redirect to order confirmation page
  await page.waitForURL(/\/order\/[a-z0-9-]+$/i, { timeout: 5000 });

  // Verify order confirmation page content
  await expect(page.getByText(/Επιβεβαίωση Παραγγελίας/i)).toBeVisible();
  await expect(page.getByText(/Αριθμός Παραγγελίας/i)).toBeVisible();
  await expect(page.getByText(json.orderId)).toBeVisible();

  // Verify order items table
  await expect(page.getByText(/Είδη Παραγγελίας/i)).toBeVisible();
  await expect(page.getByText(/Τεστ Προϊόν/i)).toBeVisible();

  // Verify shipping details
  await expect(page.getByText(/Στοιχεία Αποστολής/i)).toBeVisible();
  await expect(page.getByText(/Γιάννης Παπαδόπουλος/i)).toBeVisible();
  await expect(page.getByText(/Ακαδημίας 123/i)).toBeVisible();

  // Verify totals (should match cart: 15.5 × 2 = 31.00)
  const totalElements = await page.getByText(/€31\.00/i).all();
  expect(totalElements.length).toBeGreaterThan(0);
});

test('Resend email button calls API and returns success', async ({ page }) => {
  // First, create an order via checkout
  await page.addInitScript(() => {
    window.localStorage.setItem('dixis_cart_v1', JSON.stringify({
      items: [
        { productId: 'prod-002', title: 'Άλλο Προϊόν', price: 10, qty: 1 }
      ]
    }));
  });

  await page.goto(base + '/checkout');
  await page.waitForLoadState('networkidle');

  // Fill minimal form
  await page.fill('input[name="name"]', 'Μαρία Κούτση');
  await page.fill('input[name="line1"]', 'Πατησίων 45');
  await page.fill('input[name="city"]', 'Πειραιάς');
  await page.fill('input[name="postal"]', '18534');
  await page.fill('input[name="phone"]', '6987654321');

  // Submit and wait for order creation
  const responsePromise = page.waitForResponse(resp =>
    resp.url().includes('/api/checkout') && resp.status() === 201
  );

  await page.click('button[type="submit"]');
  const response = await responsePromise;
  const json = await response.json();

  // Wait for redirect
  await page.waitForURL(/\/order\/[a-z0-9-]+$/i, { timeout: 5000 });

  // Find and click resend button
  const resendButton = page.getByRole('button', { name: /Επαν-αποστολή Email/i });
  await expect(resendButton).toBeVisible();

  // Intercept resend API call
  const resendPromise = page.waitForResponse(resp =>
    resp.url().includes(`/api/orders/${json.orderId}/resend`) && resp.status() === 200
  );

  await resendButton.click();

  const resendResponse = await resendPromise;
  const resendJson = await resendResponse.json();

  expect(resendJson.success).toBe(true);
  expect(resendJson.message).toContain('επιτυχώς');
});

test('Order confirmation handles non-existent order with 404', async ({ page }) => {
  const fakeOrderId = 'fake-order-id-12345';

  await page.goto(base + `/order/${fakeOrderId}`);

  // Should show Next.js 404 page or notFound() response
  await expect(page.getByText(/404|Not Found|Δεν βρέθηκε/i)).toBeVisible({ timeout: 3000 });
});
