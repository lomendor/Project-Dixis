import { test, expect } from '@playwright/test';

test('homepage: styles applied & no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Προϊόντα')).toBeVisible();

  const styleCount = await page.evaluate(() => document.styleSheets.length);
  expect(styleCount).toBeGreaterThan(0);

  const fontFamily = await page.evaluate(() => getComputedStyle(document.body).fontFamily || '');
  expect(fontFamily.length).toBeGreaterThan(0);

  expect(errors, `Console errors on /: ${errors.join('\n')}`).toEqual([]);
});

test('products: no infinite reload loop (8s window)', async ({ page }) => {
  let navigations = 0;
  page.on('framenavigated', () => { navigations++; });
  await page.goto('/products', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  expect(navigations).toBeLessThan(3);
});
