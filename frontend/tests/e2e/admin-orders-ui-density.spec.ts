import { test, expect } from '@playwright/test';

test('Orders UI: density toggle reduces row spacing', async ({ page }) => {
  await page.goto('/admin/orders?useApi=1&mode=demo&page=1&pageSize=10');

  const rows = page.locator('[role="row"][data-testid^="row-"]');
  await expect(rows.first()).toBeVisible();
  await expect(rows.nth(1)).toBeVisible();

  const y1_before = (await rows.first().boundingBox())!.y;
  const y2_before = (await rows.nth(1).boundingBox())!.y;
  const delta_before = y2_before - y1_before;

  // Toggle → compact
  await page.getByTestId('density-toggle').click();
  await expect(page.getByTestId('density-wrap')).toHaveAttribute('data-density', 'compact');

  const y1_after = (await rows.first().boundingBox())!.y;
  const y2_after = (await rows.nth(1).boundingBox())!.y;
  const delta_after = y2_after - y1_after;

  expect(delta_after).toBeLessThan(delta_before - 1); // μικρότερο με λίγο περιθώριο
});
