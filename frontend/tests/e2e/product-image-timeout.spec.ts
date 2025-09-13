import { test, expect } from '@playwright/test';

const setupPage = async (page: any) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByTestId('page-root').waitFor({ timeout: 15000 });
};

test.describe('Product Image Timeout Tests', () => {
  test('Fast images load correctly', async ({ page }) => {
    await page.route('**/placeholder.jpg', (route) => {
      setTimeout(() => route.fulfill({ status: 200, contentType: 'image/jpeg', body: Buffer.from('fake') }), 200);
    });
    await setupPage(page);
    await expect(page.getByTestId('product-image-timeout-success').first()).toBeVisible({ timeout: 3000 });
  });

  test('Slow loading shows skeleton then success', async ({ page }) => {
    await page.route('**/placeholder.jpg', (route) => {
      setTimeout(() => route.fulfill({ status: 200, contentType: 'image/jpeg', body: Buffer.from('fake') }), 2000);
    });
    await setupPage(page);
    await expect(page.getByTestId('product-image-skeleton').first()).toBeVisible({ timeout: 1000 });
    await expect(page.getByTestId('product-image-timeout-success').first()).toBeVisible({ timeout: 6000 });
  });

  test('Timeout shows retry button and recovers', async ({ page }) => {
    let callCount = 0;
    await page.route('**/placeholder.jpg', (route) => {
      callCount++;
      const delay = callCount === 1 ? 5000 : 200;
      setTimeout(() => route.fulfill({ status: 200, contentType: 'image/jpeg', body: Buffer.from('fake') }), delay);
    });
    await setupPage(page);
    await expect(page.getByTestId('product-image-timeout-timeout').first()).toBeVisible({ timeout: 6000 });
    await page.getByTestId('product-image-retry-btn').first().click();
    await expect(page.getByTestId('product-image-timeout-success').first()).toBeVisible({ timeout: 3000 });
  });

  test('404 error shows retry button', async ({ page }) => {
    await page.route('**/placeholder.jpg', (route) => route.fulfill({ status: 404 }));
    await setupPage(page);
    await expect(page.getByTestId('product-image-timeout-error').first()).toBeVisible({ timeout: 3000 });
    await expect(page.getByTestId('product-image-retry-btn').first()).toBeVisible();
  });

  test('Retry mechanism works after multiple failures', async ({ page }) => {
    let callCount = 0;
    await page.route('**/placeholder.jpg', (route) => {
      callCount++;
      if (callCount <= 2) route.fulfill({ status: 404 });
      else route.fulfill({ status: 200, contentType: 'image/jpeg', body: Buffer.from('fake') });
    });
    await setupPage(page);
    await expect(page.getByTestId('product-image-timeout-error').first()).toBeVisible({ timeout: 3000 });
    await page.getByTestId('product-image-retry-btn').first().click();
    await page.getByTestId('product-image-retry-btn').first().click();
    await expect(page.getByTestId('product-image-timeout-success').first()).toBeVisible({ timeout: 3000 });
  });
});