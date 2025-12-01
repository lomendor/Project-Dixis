import { test, expect, devices } from '@playwright/test';

// AG116.3: Mobile-specific smoke test to detect reload loops
test.use({
  ...devices['iPhone 13'],
});

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';

test('products mobile: no reload loop & no console errors', async ({ page }) => {
  const errors: string[] = [];
  let navs = 0;

  // Capture console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  // Count navigations to detect reload loops
  page.on('framenavigated', () => {
    navs++;
  });

  await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' });

  // Wait 8 seconds to observe any reload loops
  await page.waitForTimeout(8000);

  // Expect fewer than 3 navigations (initial load + max 1-2 legitimate navigations)
  expect(navs).toBeLessThan(3);

  // Expect no console errors
  expect(errors).toEqual([]);
});
