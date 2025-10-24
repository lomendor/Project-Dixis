import { test, expect } from '@playwright/test';

test('Orders UI: facet/quick totals stay visible while scrolling', async ({ page }) => {
  await page.goto('/admin/orders?useApi=1&mode=demo&page=1&pageSize=20');

  // διάλεξε προτεραιότητα στο facet-totals, αλλιώς quick-totals
  const sticky = (await page.getByTestId('facet-totals').count()) > 0
    ? page.getByTestId('facet-totals')
    : page.getByTestId('quick-totals');

  await expect(sticky).toBeVisible();

  // scroll αρκετά
  await page.evaluate(() => window.scrollTo({ top: 1200, behavior: 'instant' }));
  await page.waitForTimeout(200);

  // εξακολουθεί να είναι ορατό και κοντά στο πάνω μέρος του viewport
  const box = await sticky.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeLessThan(80);
  }
});
