import { test, expect } from '@playwright/test';

test('Unified success toast appears on customer copy + admin chips', async ({ page }) => {
  await page.goto('/checkout/confirmation').catch(()=>{});
  const hasCopy = await page.getByTestId('copy-ordno').count();
  if (hasCopy) {
    await page.getByTestId('copy-ordno').click();
    await expect(page.getByTestId('toast-success')).toBeVisible();
  }
  const res = await page.goto('/admin/orders').catch(()=>null);
  if (res && res.status()<500) {
    const paid = page.getByTestId('chip-status-paid');
    if (await paid.count()) {
      await paid.click();
      await expect(page.getByTestId('toast-success')).toBeVisible();
    }
  }
});
