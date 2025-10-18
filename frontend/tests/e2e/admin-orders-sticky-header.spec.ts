import { test, expect } from '@playwright/test';

test('Admin Orders — sticky header stays visible while scrolling the list', async ({ page }) => {
  // Create several orders to ensure scrolling is needed
  for (let i = 0; i < 12; i++) {
    await page.goto('/checkout/flow').catch(() => test.skip(true, 'flow route not present'));
    await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
    await page.getByLabel('Πόλη').fill('Athens');
    await page.getByLabel('Τ.Κ.').fill('10431');
    await page.getByLabel('Email').fill(`sticky-${i}@dixis.dev`);
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

  // Verify scroll container exists
  const sc = page.getByTestId('orders-scroll');
  await expect(sc).toBeVisible();

  // Get initial positions before scrolling
  const { headerTopBefore, containerTop } = await sc.evaluate((el) => {
    const table = el.querySelector('table')!;
    const thead = table.querySelector('thead')!;
    const headRect = thead.getBoundingClientRect();
    const contRect = (el as HTMLElement).getBoundingClientRect();
    return { headerTopBefore: headRect.top, containerTop: contRect.top };
  });

  // Scroll down significantly
  await sc.evaluate((el) => { (el as HTMLElement).scrollTop = 500; });

  // After scrolling, thead should remain "stuck" at the top of the container
  const { headerTopAfter } = await sc.evaluate((el) => {
    const table = el.querySelector('table')!;
    const thead = table.querySelector('thead')!;
    const headRect = thead.getBoundingClientRect();
    return { headerTopAfter: headRect.top };
  });

  // Allow small tolerance (<=2px) for rendering differences
  expect(Math.abs(headerTopAfter - containerTop)).toBeLessThanOrEqual(2);

  // Verify thead is still visible
  const thead = page.locator('thead');
  await expect(thead).toBeVisible();
});
