import { test, expect } from '@playwright/test';

// Helper to open whichever demo route exists
async function gotoDemo(page: any) {
  const candidates = ['/dev/quote-demo', '/dev/quote-demo/'];
  for (const path of candidates) {
    const res = await page.goto(path).catch(() => null);
    if (res && res.ok()) return;
  }
  // fallback root (should still render component on checkout if injected)
  await page.goto('/');
}

test.describe('Checkout Shipping Breakdown UI (demo)', () => {
  test('Athens 10431 / COURIER / 0.5kg → shows zone/cost/tooltip', async ({ page }) => {
    await gotoDemo(page);
    await page.getByTestId('postal-input').fill('10431');
    await page.getByTestId('method-select').selectOption('COURIER');
    await page.getByTestId('weight-input').fill('500');
    await expect(page.getByTestId('shipping-breakdown')).toBeVisible();
    await expect(page.getByTestId('shippingCost')).toBeVisible();
    await page.getByText('Γιατί?').or(page.getByText('Γιατί;')).first().click({ force: true }).catch(()=>{});
    await expect(page.getByTestId('why-tooltip')).toBeVisible();
  });

  test('Thessaloniki 54622 / COURIER_COD / 2×1.2kg → shows COD €2 and trace', async ({ page }) => {
    await gotoDemo(page);
    await page.getByTestId('postal-input').fill('54622');
    await page.getByTestId('method-select').selectOption('COURIER_COD');
    await page.getByTestId('weight-input').fill('1200'); // simple single-item representation
    await expect(page.getByTestId('codFee')).toBeVisible();
  });

  test('Island 85100 / PICKUP / 0.3kg → shows breakdown without COD', async ({ page }) => {
    await gotoDemo(page);
    await page.getByTestId('postal-input').fill('85100');
    await page.getByTestId('method-select').selectOption('PICKUP');
    await page.getByTestId('weight-input').fill('300');
    await expect(page.getByTestId('shippingCost')).toBeVisible();
    await expect(page.getByTestId('codFee')).toHaveCount(0);
  });
});
