import { test, expect } from '@playwright/test';

test.describe('Notification Delivery (Smoke)', () => {
  test('API simulates delivery when DIXIS_SMS_DISABLE=1', async ({ request }) => {
    // Queue a notification via dev endpoint (or directly via DB in a real scenario)
    // For this smoke test, we assume notifications exist in the DB from previous actions

    // Call the delivery API
    const res = await request.post('http://127.0.0.1:3000/api/dev/notifications/deliver');
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body).toHaveProperty('delivered');
    expect(Array.isArray(body.delivered)).toBeTruthy();

    // Verify simulated delivery (if any notifications existed)
    // In CI with DIXIS_SMS_DISABLE=1, all should be marked as simulated
    if (body.delivered.length > 0) {
      body.delivered.forEach((item: any) => {
        if (item.ok) {
          expect(item.simulated).toBe(true);
        }
      });
    }
  });

  test('Dev page shows notifications outbox', async ({ page }) => {
    await page.goto('http://127.0.0.1:3000/dev/notifications');
    await expect(page.locator('h1')).toContainText('Notifications Outbox');

    // Should see table structure
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });
});
