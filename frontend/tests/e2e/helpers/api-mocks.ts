import { Page } from '@playwright/test';

export class ApiMockHelper {
  constructor(private page: Page) {}
  async setupCartMocks() {
    // Mock auth endpoints
    await this.page.route('**/api/v1/auth/me', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 1, name: 'Test Consumer', email: 'test@example.com', role: 'consumer' },
          isAuthenticated: true
        })
      });
    });

    await this.page.route('**/api/auth/**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    });

    // Mock cart items endpoint  
    await this.page.route('**/api/v1/cart/items', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          cart_items: [{
            id: 1, product_id: 1, name: 'Κρητικό Ελαιόλαδο', producer_name: 'Κρητικός Παραγωγός',
            price: 12.50, quantity: 2, subtotal: 25.00
          }],
          total_items: 2, total_amount: '25.00'
        })
      });
    });

    // Mock shipping methods endpoint
    await this.page.route('**/api/v1/shipping/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          shipping_methods: [
            {
              id: 'standard',
              name: 'Κανονική Παράδοση',
              price: 3.50,
              estimated_days: 2
            }
          ]
        })
      });
    });

    // Mock products endpoint for navigation
    await this.page.route('**/api/v1/public/products*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ products: [] })
      });
    });

    // Mock any other API calls to prevent network errors
    await this.page.route('**/api/**', (route) => {
      if (!route.request().url().includes('/cart/') && !route.request().url().includes('/auth/')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      } else {
        route.continue();
      }
    });
  }
}