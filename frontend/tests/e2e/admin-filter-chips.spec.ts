import { test, expect } from '@playwright/test';

test('Admin Orders — Filter chips (status/method) + Clear-all', async ({ page }) => {
  // Navigate to admin orders
  await page.goto('/admin/orders');
  await page.waitForSelector('[data-testid="orders-scroll"]', { timeout: 5000 });

  // Verify chips toolbar exists
  await page.waitForSelector('[data-testid="chips-toolbar"]', { timeout: 5000 });
  await expect(page.getByTestId('chips-toolbar')).toBeVisible();

  // Verify status chips exist
  await expect(page.getByTestId('chip-status-paid')).toBeVisible();
  await expect(page.getByTestId('chip-status-pending')).toBeVisible();
  await expect(page.getByTestId('chip-status-canceled')).toBeVisible();

  // Verify method chips exist
  await expect(page.getByTestId('chip-method-courier')).toBeVisible();
  await expect(page.getByTestId('chip-method-pickup')).toBeVisible();

  // Verify clear-all button exists
  await expect(page.getByTestId('chip-clear')).toBeVisible();

  // Test status chip toggle
  await page.getByTestId('chip-status-paid').click();
  await page.waitForTimeout(200); // Allow URL update
  expect(page.url()).toContain('status=PAID');

  // Verify chip is active (black background)
  const paidChip = page.getByTestId('chip-status-paid');
  const paidBg = await paidChip.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  expect(paidBg).toContain('rgb(0, 0, 0)'); // black

  // Test method chip toggle
  await page.getByTestId('chip-method-courier').click();
  await page.waitForTimeout(200);
  expect(page.url()).toContain('method=COURIER');

  // Verify both chips active
  const courierChip = page.getByTestId('chip-method-courier');
  const courierBg = await courierChip.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  expect(courierBg).toContain('rgb(0, 0, 0)');

  // Test clear-all button
  await page.getByTestId('chip-clear').click();
  await page.waitForTimeout(200);
  expect(page.url()).not.toContain('status=');
  expect(page.url()).not.toContain('method=');

  // Verify chips inactive (background reset)
  const paidBgAfter = await paidChip.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  const courierBgAfter = await courierChip.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  expect(paidBgAfter).not.toContain('rgb(0, 0, 0)');
  expect(courierBgAfter).not.toContain('rgb(0, 0, 0)');

  // Test chip deactivation (click active chip again)
  await page.getByTestId('chip-status-pending').click();
  await page.waitForTimeout(200);
  expect(page.url()).toContain('status=PENDING');

  await page.getByTestId('chip-status-pending').click();
  await page.waitForTimeout(200);
  expect(page.url()).not.toContain('status=');
});
