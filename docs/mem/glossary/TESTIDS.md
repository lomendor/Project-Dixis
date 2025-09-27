# 🎯 TEST IDS GLOSSARY

**Critical Test Selectors for E2E Testing**

## 🛒 CHECKOUT FLOW SELECTORS

### **Primary Checkout Elements**
| Test ID | Purpose | Component Location | Usage Context |
|---------|---------|-------------------|---------------|
| `checkout-cta` | Main checkout button | Cart page | **CRITICAL**: Entry point to checkout flow |
| `checkout-btn` | Checkout initiation | Cart summary | Alternative checkout trigger |

### **Shipping Information Form** [[E2E]]
| Test ID | Purpose | Component Location | Usage Context |
|---------|---------|-------------------|---------------|
| `shipping-name-input` | Customer name field | Checkout shipping form | Form validation testing |
| `shipping-address-input` | Address field | Checkout shipping form | Required field validation |
| `shipping-city-input` | City field | Checkout shipping form | Geographic data input |
| `shipping-postal-code-input` | Postal code field | Checkout shipping form | Format validation (Greek postal codes) |
| `shipping-phone-input` | Phone number field | Checkout shipping form | Contact information |

### **Checkout Flow Navigation**
| Test ID | Purpose | Component Location | Usage Context |
|---------|---------|-------------------|---------------|
| `continue-to-review-btn` | Proceed to review step | Shipping form | Step progression trigger |
| `proceed-to-payment-btn` | Move to payment | Review step | Payment flow initiation |
| `process-payment-btn` | Execute payment | Payment step | Transaction completion |

### **Confirmation & Success States**
| Test ID | Purpose | Component Location | Usage Context |
|---------|---------|-------------------|---------------|
| `confirmation-title` | Order success title | Confirmation page | Success verification |
| `order-total` | Final order amount | Multiple pages | Quote calculation testing |
| `continue-shopping-btn` | Return to catalog | Confirmation page | Post-purchase navigation |
| `order-success` | Success indicator | Order details | Order completion status |

## 🛍️ PRODUCT & CART SELECTORS

### **Product Catalog**
| Test ID | Purpose | Component Location | Usage Context |
|---------|---------|-------------------|---------------|
| `product-card` | Individual product | Product listings | Product display testing |
| `add-to-cart` | Add product to cart | Product cards | **CRITICAL**: Cart seeding for tests |
| `add-to-cart-btn` | Alternative add button | Product pages | Cart functionality |

### **Cart Management**
| Test ID | Purpose | Component Location | Usage Context |
|---------|---------|-------------------|---------------|
| `cart-item` | Individual cart entry | Cart page | Cart content validation |
| `cart-total` | Cart subtotal | Cart summary | Price calculation |

## 🚚 SHIPPING & DELIVERY SELECTORS

### **Delivery Options**
| Test ID | Purpose | Component Location | Usage Context |
|---------|---------|-------------------|---------------|
| `delivery-method-selector` | Delivery type chooser | Shipping options | Method selection testing |
| `delivery-method-home` | Home delivery option | Delivery selector | Default delivery choice |
| `delivery-method-locker` | Locker delivery option | Delivery selector | Alternative delivery |
| `postal-code-input` | Postal code for shipping | Address forms | Shipping calculation trigger |
| `city-input` | City for shipping | Address forms | Geographic validation |
| `shipping-cost` | Shipping fee display | Order summary | Cost calculation verification |

## 👤 USER INTERFACE SELECTORS

### **Navigation & Authentication**
| Test ID | Purpose | Component Location | Usage Context |
|---------|---------|-------------------|---------------|
| `user-menu` | User account menu | Navigation bar | Authentication status |
| `logout-btn` | Logout action | User menu | Session management |

### **General UI Elements**
| Test ID | Purpose | Component Location | Usage Context |
|---------|---------|-------------------|---------------|
| `home-client` | Home page wrapper | Main page | Page load verification |

## 🔍 USAGE PATTERNS

### **Critical Path Testing** [[CI-RCA]]
```typescript
// 1. Cart seeding (required before checkout)
await page.getByTestId('add-to-cart').first().click();

// 2. Checkout initiation
await page.getByTestId('checkout-cta').click();

// 3. Form completion sequence
await page.getByTestId('shipping-name-input').fill('Test User');
await page.getByTestId('shipping-address-input').fill('Test Address');
await page.getByTestId('continue-to-review-btn').click();

// 4. Payment flow
await page.getByTestId('proceed-to-payment-btn').click();
await page.getByTestId('process-payment-btn').click();

// 5. Success verification
await expect(page.getByTestId('confirmation-title')).toBeVisible();
```

### **Quote Calculation Testing**
```typescript
// Monitor price changes during checkout
const initialTotal = await page.getByTestId('order-total').textContent();
// ... shipping form submission ...
const finalTotal = await page.getByTestId('order-total').textContent();
expect(initialTotal).not.toBe(finalTotal); // Should include shipping
```

### **Form Validation Testing**
```typescript
// Test required field validation
await page.getByTestId('continue-to-review-btn').click();
await expect(page.getByTestId('shipping-name-input')).toHaveAttribute('required');
```

## ⚠️ SELECTOR STABILITY NOTES

### **Reliable Selectors** ✅
- `checkout-cta` - Stable, well-tested
- `shipping-*-input` - Form field selectors are consistent
- `confirmation-title` - Reliable success indicator

### **Alternative Patterns** ⚠️
```typescript
// Multiple selector strategies for resilience
const addToCartBtn = page.locator([
  '[data-testid="add-to-cart"]',
  'button:has-text("Add to Cart")'
].join(', '));
```

### **Fallback Selectors**
```typescript
// When testid not available, use content-based selectors
const shippingCost = page.locator([
  '[data-testid="shipping-cost"]',
  ':text("Shipping")',
  ':text("Μεταφορικά")'
].join(', '));
```

## 🚨 CRITICAL DEPENDENCIES

### **Test Setup Requirements**
1. **Cart Seeding**: `add-to-cart` must work before `checkout-cta`
2. **Auth States**: User authentication affects checkout flow
3. **Service Dependencies**: Backend API must be responsive

### **Timing Considerations** [[E2E]]
```typescript
// Always wait for elements before interaction
await page.getByTestId('checkout-cta').waitFor({ timeout: 15000 });

// Handle async operations (quote calculations)
await waitForQuoteUpdate(page, previousTotal);
```

## 📁 SELECTOR SOURCE MAPPING

### **Component Locations**
```
frontend/src/app/cart/page.tsx
├── checkout-btn (line 284)
├── cart-item (line 190)

frontend/src/components/Navigation.tsx
├── user-menu (line 61)
├── logout-btn (line 66)

frontend/src/app/orders/[id]/page.tsx
├── order-success (line 253)
```

### **Test File Usage**
```
frontend/tests/e2e/checkout.spec.ts
├── checkout-cta, shipping-*-input, continue-to-review-btn
├── proceed-to-payment-btn, process-payment-btn
├── confirmation-title, order-total

frontend/tests/e2e/shipping-integration-flow.spec.ts
├── add-to-cart, cart-item, postal-code-input
├── shipping-cost, delivery-method-*
```

## 🔧 MAINTENANCE GUIDELINES

### **Adding New Test IDs**
1. **Use descriptive names**: `action-target` pattern
2. **Follow namespace conventions**: `section-element-type`
3. **Update this glossary**: Document purpose and location
4. **Test stability**: Verify selectors work across browsers

### **Selector Naming Patterns**
- **Actions**: `*-btn`, `*-cta`, `*-link`
- **Inputs**: `*-input`, `*-field`, `*-selector`
- **Display**: `*-title`, `*-total`, `*-cost`
- **Containers**: `*-menu`, `*-card`, `*-item`

---

**Last Updated**: 2025-09-27 | **Total Selectors**: 25+ documented
**Related**: [[E2E]], [[CI-RCA]], [[MAP]]
**Source Analysis**: `grep -r "data-testid\|getByTestId" frontend/`