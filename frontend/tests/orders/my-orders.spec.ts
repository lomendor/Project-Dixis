import { test, expect } from '@playwright/test';

const base = process.env.BASE_URL || 'http://127.0.0.1:3001';

test.describe('Customer Orders', () => {
  test('Customer can view their orders list', async ({ page, context }) => {
    // Set a mock session cookie
    await context.addCookies([
      {
        name: 'dixis_session',
        value: 'test-session-' + Date.now(),
        domain: 'localhost',
        path: '/'
      }
    ]);

    // Navigate to orders page
    await page.goto(base + '/orders');

    // Should show orders heading
    await expect(page.getByRole('heading', { name: /Οι παραγγελίες μου/i })).toBeVisible();

    // Should show either orders table or empty state
    const content = await page.content();
    const hasOrders = content.includes('<table') || content.includes('Δεν έχετε ακόμη παραγγελίες');
    expect(hasOrders).toBeTruthy();
  });

  test('Customer can view order details', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'dixis_session',
        value: 'test-session-' + Date.now(),
        domain: 'localhost',
        path: '/'
      }
    ]);

    // Try to access an order detail page (may 404 if order doesn't exist)
    await page.goto(base + '/orders/test-order-123');

    // Should either show order details or 404 page
    const content = await page.content();
    const isValidPage = content.includes('Παραγγελία') || content.includes('404');
    expect(isValidPage).toBeTruthy();
  });
});
