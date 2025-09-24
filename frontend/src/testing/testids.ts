/**
 * Test IDs for E2E testing
 * Centralized constants to maintain consistency across components and tests
 */

// Product Detail Page (PDP)
export const PDP_TESTIDS = {
  ADD_TO_CART: 'pdp-add-to-cart',
  QUANTITY_SELECT: 'pdp-qty-select',
  PRODUCT_IMAGE: 'pdp-product-image',
  PRODUCT_TITLE: 'pdp-product-title',
  PRODUCT_PRICE: 'pdp-product-price',
  STOCK_INFO: 'pdp-stock-info',
} as const;

// Cart Page
export const CART_TESTIDS = {
  ITEM: 'cart-item',
  TOTAL_AMOUNT: 'cart-total-amount',
  SUMMARY: 'cart-summary',
  POSTAL_CODE: 'postal-code',
  CITY: 'city',
} as const;

// Shipping Components
export const SHIPPING_TESTIDS = {
  QUOTE_SUCCESS: 'shipping-quote-success',
  METHOD: 'shipping-method',
  COST: 'shipping-cost',
} as const;

// Product Cards/Lists
export const PRODUCT_TESTIDS = {
  CARD: 'product-card',
  ADD_TO_CART: 'add-to-cart', // Legacy for existing tests
} as const;

// Navigation/Auth
export const NAV_TESTIDS = {
  USER_MENU: 'user-menu',
  LOGIN_LINK: 'login-link',
} as const;

// Export all as single object for easy importing
export const TESTIDS = {
  PDP: PDP_TESTIDS,
  CART: CART_TESTIDS,
  SHIPPING: SHIPPING_TESTIDS,
  PRODUCT: PRODUCT_TESTIDS,
  NAV: NAV_TESTIDS,
} as const;

export default TESTIDS;