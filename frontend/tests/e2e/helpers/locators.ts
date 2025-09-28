import { Page } from '@playwright/test';

// tests-only helpers: prefer data-testid, fallback to roles with i18n regex
export const sel = {
  navProducts: (page: Page) =>
    page.getByTestId('nav-products').first()
      .or(page.getByRole('link', { name: /products|προϊόντα/i })),

  productCards: (page: Page) =>
    page.getByTestId('product-card')
      .or(page.locator('[data-testid*="product"]'))
      .or(page.getByRole('link', { name: /add|προσθήκη|προϊόν/i })),

  firstProduct: (page: Page) =>
    sel.productCards(page).first(),

  cartLink: (page: Page) =>
    page.getByTestId('cart-link')
      .or(page.getByTestId('nav-cart'))
      .or(page.getByRole('link', { name: /cart|καλάθ/i })),

  checkoutCta: (page: Page) =>
    page.getByTestId('checkout-btn')
      .or(page.getByTestId('checkout-cta'))
      .or(page.getByRole('button', { name: /checkout|proceed|πληρωμή|ταμείο/i })),

  loginEmail: (page: Page) =>
    page.getByRole('textbox', { name: /email|ηλ.*ταχυδρομ/i })
      .or(page.locator('input[type="email"]'))
      .or(page.locator('input[name="email"]')),

  loginPassword: (page: Page) =>
    page.getByRole('textbox', { name: /password|κωδικός/i })
      .or(page.locator('input[type="password"]'))
      .or(page.locator('input[name="password"]')),

  addToCartBtn: (page: Page) =>
    page.getByTestId('add-to-cart-btn')
      .or(page.getByRole('button', { name: /add.*cart|προσθήκη.*καλάθ/i })),
};

export async function robustGoto(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
    // Continue even if networkidle times out
  });
}

export async function clearGuestState(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    try { localStorage.clear(); } catch {}
    try { sessionStorage.clear(); } catch {}
  });
}

export async function waitForProductsLoaded(page: Page) {
  // Wait for either product cards or loading indicator to disappear
  await Promise.race([
    page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 }),
    page.waitForSelector('[data-testid="loading-spinner"]', { state: 'hidden', timeout: 15000 }).catch(() => {}),
  ]);
  // Give a bit more time for all products to render
  await page.waitForTimeout(500);
}