import { test, expect } from '@playwright/test';

test('Admin Orders — per-row Copy ordNo/Link actions show toast', async ({ page }) => {
  // Δημιούργησε 2 παραγγελίες για να έχουμε λίστα
  for (const i of [1, 2]) {
    await page.goto('/checkout/flow').catch(() => test.skip(true, 'flow route not present'));
    await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
    await page.getByLabel('Πόλη').fill('Athens');
    await page.getByLabel('Τ.Κ.').fill('10431');
    await page.getByLabel('Email').fill(`rowcopy-${i}@dixis.dev`);
    await page.getByTestId('flow-method').selectOption('COURIER');
    await page.getByTestId('flow-weight').fill('500');
    await page.getByTestId('flow-subtotal').fill('42');
    await page.getByTestId('flow-proceed').click();
    await expect(page.getByText('Πληρωμή')).toBeVisible();
    await page.getByTestId('pay-now').click();
    await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible();
  }

  const res = await page.goto('/admin/orders');
  if (!res || res.status() >= 400) test.skip(true, 'admin list not available locally');

  // Βεβαιώσου ότι εμφανίστηκαν τα actions στην πρώτη γραμμή
  const firstCopyOrd = page.getByTestId('row-copy-ordno').first();
  const firstCopyLink = page.getByTestId('row-copy-link').first();
  await expect(firstCopyOrd).toBeVisible();
  await expect(firstCopyLink).toBeVisible();

  // Πατά Copy ordNo → εμφανίζεται toast
  await firstCopyOrd.click();
  await expect(page.getByTestId('row-copy-toast').first()).toBeVisible();

  // Πατά Copy link → εμφανίζεται ξανά toast
  await firstCopyLink.click();
  await expect(page.getByTestId('row-copy-toast').first()).toBeVisible();
});
