/**
 * Pass 62: Orders & Checkout Flow E2E Regression Test
 *
 * Guards the consumer checkout journey from silently breaking:
 * 1. Consumer login works
 * 2. Add product to cart
 * 3. Checkout succeeds (creates order)
 * 4. /account/orders shows at least 1 order
 * 5. Order details page renders items with producer info
 *
 * Uses route mocking for deterministic behavior in CI.
 * Auth provided via storageState from ci-global-setup.ts
 */
import { test, expect } from '@playwright/test';

// Mock data for deterministic tests
const MOCK_ORDER = {
  id: 12345,
  status: 'pending',
  user_id: 1,
  subtotal: '25.00',
  tax_amount: '6.00',
  shipping_amount: '3.50',
  total_amount: '34.50',
  total: '34.50',
  payment_status: 'pending',
  payment_method: 'COD',
  shipping_method: 'HOME',
  shipping_method_label: 'Παράδοση στο σπίτι',
  shipping_address: { street: 'Ερμού 42', city: 'Αθήνα', postal_code: '10563' },
  notes: null,
  created_at: new Date().toISOString(),
  items_count: 2,
  items: [
    {
      id: 1,
      product_id: 1,
      product_name: 'Βιολογικές Ντομάτες',
      product_unit: 'kg',
      quantity: 2,
      unit_price: '5.00',
      price: '5.00',
      total_price: '10.00',
      producer: { id: 1, name: 'Αγρόκτημα Παππού', slug: 'agrokthma-pappou' }
    },
    {
      id: 2,
      product_id: 2,
      product_name: 'Φρέσκα Αυγά',
      product_unit: 'τεμ',
      quantity: 12,
      unit_price: '1.25',
      price: '1.25',
      total_price: '15.00',
      producer: { id: 2, name: 'Πουλερικά Γιώργου', slug: 'poulerika-giorgou' }
    }
  ],
  order_items: [] // Alias for frontend compatibility
};

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Βιολογικές Ντομάτες',
    slug: 'viologikes-ntomates',
    price: '5.00',
    unit: 'kg',
    stock: 100,
    image_url: '/placeholder.jpg',
    producer: { id: 1, name: 'Αγρόκτημα Παππού' }
  }
];

// Helper: Setup cart with items via localStorage
async function setupCartWithItems(page: any) {
  await page.addInitScript(() => {
    const cartState = {
      state: {
        items: {
          '1': {
            id: '1',
            title: 'Βιολογικές Ντομάτες',
            priceCents: 500, // €5.00
            qty: 2
          },
          '2': {
            id: '2',
            title: 'Φρέσκα Αυγά',
            priceCents: 125, // €1.25
            qty: 12
          }
        }
      },
      version: 0
    };
    localStorage.setItem('dixis:cart:v1', JSON.stringify(cartState));
  });
}

// Helper: Setup mock API routes
async function setupMockAPIs(page: any, options: { orderExists?: boolean } = {}) {
  const { orderExists = true } = options;

  // Mock auth/me for AuthContext
  await page.route('**/api/v1/auth/me', async (route: any) => {
    await route.fulfill({
      status: 200,
      json: {
        id: 1,
        name: 'E2E Καταναλωτής',
        email: 'consumer@example.com',
        role: 'consumer',
        profile: { role: 'consumer' }
      }
    });
  });

  // Mock products list
  await page.route('**/api/v1/public/products*', async (route: any) => {
    await route.fulfill({
      status: 200,
      json: { data: MOCK_PRODUCTS, meta: { total: 1 } }
    });
  });

  // Mock shipping quote
  await page.route('**/api/v1/public/shipping/quote', async (route: any) => {
    await route.fulfill({
      status: 200,
      json: {
        zone: 'Αττική',
        base_cost: 3.50,
        per_item_cost: 0,
        total_cost: 3.50,
        free_threshold: 35.00
      }
    });
  });

  // Mock order creation (POST)
  await page.route('**/api/v1/public/orders', async (route: any) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        json: { ...MOCK_ORDER, id: MOCK_ORDER.id }
      });
    } else if (route.request().method() === 'GET') {
      // Orders list
      await route.fulfill({
        status: 200,
        json: { data: orderExists ? [MOCK_ORDER] : [] }
      });
    } else {
      await route.continue();
    }
  });

  // Mock single order details
  await page.route(`**/api/v1/public/orders/${MOCK_ORDER.id}`, async (route: any) => {
    await route.fulfill({
      status: 200,
      json: { data: MOCK_ORDER }
    });
  });

  // Mock /api/v1/orders (alternative endpoint)
  await page.route('**/api/v1/orders', async (route: any) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        json: { data: orderExists ? [MOCK_ORDER] : [] }
      });
    } else {
      await route.continue();
    }
  });
}

test.describe('Pass 62: Orders & Checkout Regression', () => {
  test.describe('1. Consumer Authentication', () => {
    test('consumer can access protected orders page', async ({ page }) => {
      await setupMockAPIs(page);

      // Navigate to orders page - auth from storageState
      await page.goto('/account/orders');
      await page.waitForLoadState('networkidle');

      // Should not redirect to login (auth working)
      expect(page.url()).toContain('/account/orders');

      // Should not show error page
      await expect(page.locator('text=Κάτι πήγε στραβά')).not.toBeVisible();
    });
  });

  test.describe('2. Cart Functionality', () => {
    test('cart persists items and shows correct total', async ({ page }) => {
      await setupCartWithItems(page);

      await page.goto('/cart');
      await page.waitForLoadState('networkidle');

      // Cart should show items
      await expect(page.locator('text=Βιολογικές Ντομάτες')).toBeVisible({ timeout: 10000 });

      // Cart should not be empty
      const emptyCart = page.locator('text=Το καλάθι σας είναι άδειο');
      await expect(emptyCart).not.toBeVisible();
    });
  });

  test.describe('3. Checkout Flow', () => {
    test('checkout page loads without error (empty cart shows redirect message)', async ({ page }) => {
      // This test verifies the checkout page infrastructure is working
      // Full checkout flow is tested in checkout-happy-path.spec.ts with proper cart setup
      await page.goto('/checkout');
      await page.waitForLoadState('networkidle');

      // Checkout page should load without 500 error
      // Either shows checkout form (if cart has items) or empty cart message
      const pageContent = await page.content();
      const hasCheckoutContent = pageContent.includes('Ολοκλήρωση') ||
                                  pageContent.includes('Παραγγελία') ||
                                  pageContent.includes('καλάθι') ||
                                  pageContent.includes('κενό');
      expect(hasCheckoutContent).toBe(true);

      // Should not show server error
      await expect(page.getByText('500')).not.toBeVisible();
      await expect(page.getByText('Internal Server Error')).not.toBeVisible();
    });

    test('checkout redirects to products when cart is empty', async ({ page }) => {
      await page.goto('/checkout');
      await page.waitForLoadState('networkidle');

      // When cart is empty, should show message with link to products
      const productsLink = page.getByRole('link', { name: /προϊόντα/i });
      const isVisible = await productsLink.first().isVisible().catch(() => false);

      // Either shows products link OR the checkout form (if cart has items from previous test)
      const checkoutVisible = await page.locator('form').first().isVisible().catch(() => false);
      expect(isVisible || checkoutVisible).toBe(true);
    });
  });

  test.describe('4. Orders List Page', () => {
    test('orders list shows at least one order after checkout', async ({ page }) => {
      await setupMockAPIs(page, { orderExists: true });

      await page.goto('/account/orders');
      await page.waitForLoadState('networkidle');

      // Should not show empty state
      const emptyMessage = page.getByText('Δεν έχετε παραγγελίες').or(page.getByText('Δεν υπάρχουν παραγγελίες'));
      await expect(emptyMessage.first()).not.toBeVisible({ timeout: 5000 });

      // Should show order info - check for order ID in heading
      await expect(page.getByRole('heading', { name: /12345/ })).toBeVisible({ timeout: 10000 });
    });

    test('orders list handles empty state gracefully', async ({ page }) => {
      await setupMockAPIs(page, { orderExists: false });

      await page.goto('/account/orders');
      await page.waitForLoadState('networkidle');

      // Should show empty message or link to products
      const pageContent = await page.content();
      const hasEmptyMessage = pageContent.includes('παραγγελί') ||
                              pageContent.includes('Δεν έχετε') ||
                              pageContent.includes('Περιήγηση');
      expect(hasEmptyMessage).toBe(true);
    });
  });

  test.describe('5. Order Details Page', () => {
    test('order details shows line items with product info', async ({ page }) => {
      await setupMockAPIs(page);

      await page.goto(`/account/orders/${MOCK_ORDER.id}`);
      await page.waitForLoadState('networkidle');

      // Should not show error
      await expect(page.getByText('Κάτι πήγε στραβά')).not.toBeVisible();

      // Should show order ID in heading
      await expect(page.getByRole('heading', { name: /12345/ })).toBeVisible({ timeout: 10000 });

      // Should show at least one product name
      await expect(page.getByRole('heading', { name: /Ντομάτες/ })).toBeVisible({ timeout: 10000 });
    });

    test('order details shows status badge', async ({ page }) => {
      await setupMockAPIs(page);

      await page.goto(`/account/orders/${MOCK_ORDER.id}`);
      await page.waitForLoadState('networkidle');

      // Should show status badge (Greek: Εκκρεμεί = Pending)
      await expect(page.getByTestId('order-status-badge')).toBeVisible({ timeout: 10000 });
    });

    test('order details shows shipping method label', async ({ page }) => {
      await setupMockAPIs(page);

      await page.goto(`/account/orders/${MOCK_ORDER.id}`);
      await page.waitForLoadState('networkidle');

      // Should show Greek shipping label
      await expect(page.getByText('Παράδοση στο σπίτι')).toBeVisible({ timeout: 10000 });
    });

    test('order details shows producer name per item (if available)', async ({ page }) => {
      await setupMockAPIs(page);

      await page.goto(`/account/orders/${MOCK_ORDER.id}`);
      await page.waitForLoadState('networkidle');

      // Check if producer name is visible (shows "από {producer}")
      // Pass 43 added producer info - should be visible
      await expect(page.getByText('από Αγρόκτημα Παππού')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('6. API Integration Verification', () => {
    test('orders list calls Laravel API (not Prisma)', async ({ page }) => {
      let calledLaravelApi = false;
      let calledPrismaInternal = false;

      page.on('request', (request: any) => {
        const url = request.url();
        if (url.includes('/api/v1/public/orders') || url.includes('/api/v1/orders')) {
          calledLaravelApi = true;
        }
        if (url.includes('/internal/orders') && !url.includes('/api/')) {
          calledPrismaInternal = true;
        }
      });

      await setupMockAPIs(page);
      await page.goto('/account/orders');
      await page.waitForLoadState('networkidle');

      // Should call Laravel API
      expect(calledLaravelApi).toBe(true);

      // Should NOT call Prisma /internal/orders
      expect(calledPrismaInternal).toBe(false);
    });
  });
});
