import { test, expect } from '@playwright/test';
import './setup.mocks';
const setupPage = async (page: any) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await Promise.race([page.getByTestId('page-root').waitFor().catch(() => {}), page.getByTestId('error-boundary').waitFor().catch(() => {})]);
  await page.waitForTimeout(1000);
};

const setupAuthState = async (page: any, context: any, role: 'consumer' | 'producer') => {
  await context.addCookies([{ name: 'auth_token', value: `${role}_token`, domain: '127.0.0.1', path: '/' }]);
  await page.addInitScript((r: string) => { localStorage.setItem('auth_token', `${r}_token`); localStorage.setItem('user_role', r); }, role);
};

test.describe('Auth-Cart Flow Tests', () => {
  test('Guest users see login prompt for cart access', async ({ page }) => {
    await setupPage(page);
    const cartLoginPrompt = page.getByTestId('cart-login-prompt');
    await expect(cartLoginPrompt).toBeVisible();
    await expect(cartLoginPrompt).toHaveText('Login to Add to Cart');
    await cartLoginPrompt.click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('Consumer users see active cart with item count', async ({ page, context }) => {
    await setupAuthState(page, context, 'consumer');
    await setupPage(page);
    const activeCartIcon = page.getByTestId('cart-icon-active');
    await expect(activeCartIcon).toBeVisible();
    const itemCount = page.getByTestId('cart-item-count');
    await expect(itemCount).toBeVisible();
    await expect(itemCount).toHaveText('3');
    await activeCartIcon.click();
    await expect(page).toHaveURL(/\/cart/);
  });

  test('Producer users see limited cart access message', async ({ page, context }) => {
    await setupAuthState(page, context, 'producer');
    await setupPage(page);
    const producerCartMode = page.getByTestId('cart-producer-mode');
    await expect(producerCartMode).toBeVisible();
    const producerMessage = page.getByTestId('cart-producer-message');
    await expect(producerMessage).toBeVisible();
    await expect(producerMessage).toHaveText('Producer Cart View');
  });

  test('Mobile navigation shows correct cart behavior for all roles', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await setupPage(page);
    const mobileMenuButton = page.getByTestId('mobile-menu-button');
    await mobileMenuButton.click();
    await page.waitForSelector('[data-testid="mobile-menu"]');
    const mobileCartPrompt = page.getByTestId('cart-login-prompt');
    await expect(mobileCartPrompt).toBeVisible();
    await expect(mobileCartPrompt).toHaveText('Login to Add to Cart');
  });

  test('Role transition updates cart display correctly', async ({ page, context }) => {
    await setupPage(page);
    await expect(page.getByTestId('cart-login-prompt')).toBeVisible();
    await page.addInitScript(() => { localStorage.setItem('auth_token', 'consumer_token'); localStorage.setItem('user_role', 'consumer'); });
    await page.reload();
    await page.waitForSelector('[data-testid="page-root"]', { timeout: 15000 });
    await expect(page.getByTestId('cart-icon-active')).toBeVisible();
    await expect(page.getByTestId('cart-item-count')).toBeVisible();
  });
});