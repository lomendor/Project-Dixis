import { test, expect } from '@playwright/test';

// AG116.8: Empty-state smoke test (no reload loop, displays proper messaging)
const BASE = process.env.BASE_URL || 'https://dixis.io';

test('products empty-state: no reload loop & proper messaging', async ({ page }) => {
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
  expect(navs, 'navigation count should be <3').toBeLessThan(3);

  // Expect no console errors
  expect(errors, 'no console errors').toEqual([]);

  // Check for empty state content
  const emptyState = page.getByTestId('empty-state');

  // Empty state should be visible
  await expect(emptyState).toBeVisible();

  // Check for expected text content
  await expect(emptyState).toContainText('Δεν υπάρχουν προϊόντα ακόμη');
  await expect(emptyState).toContainText('Όταν προστεθούν προϊόντα, θα εμφανιστούν εδώ');

  // Check for action button
  const homeLink = emptyState.locator('a[href="/"]');
  await expect(homeLink).toBeVisible();
  await expect(homeLink).toContainText('Αρχική');
});
