# E2E Specs Normalization Inventory

**Date**: 2025-09-24
**Goal**: Eliminate hardcoded URLs and standardize selectors in E2E specs
**Scope**: Critical cart/checkout flows + baseURL normalization

## 📊 INVENTORY SUMMARY

- **Hardcoded URLs Found**: 45 instances across 20 files
- **page.goto() with full URLs**: 26 instances
- **Text Selectors Requiring Conversion**: 25+ critical instances
- **Data-TestIds Already Present**: ✅ Good coverage in core flows

## 🔍 DETAILED FINDINGS

### 1. Hardcoded URLs (BaseURL Issues)

| File | Line | Issue | Fix Required |
|------|------|-------|--------------|
| `greek-normalization-demo.spec.ts` | 5 | `http://localhost:3001` | Use `page.goto('/')` |
| `integration-smoke.spec.ts` | 5-6 | `http://127.0.0.1:8001`, `http://127.0.0.1:3001` | Use env vars |
| `pr-pp03-d-checkout-edge-cases.spec.ts` | 19-21 | Hardcoded API endpoints | Use baseURL |
| `pr-pp03-d-checkout-edge-cases.spec.ts` | 47,54,203,206,285,288,388,394 | Multiple `http://127.0.0.1:3001` | Convert to relative paths |
| `pr-pp03-b-evidence.spec.ts` | 5 | `http://localhost:3001` | Use `page.goto('/')` |
| `latin-transliteration.spec.ts` | 5 | `http://localhost:3000` | Fix port + use relative |
| `pr-pp03-b-search-evidence.spec.ts` | 6 | `http://127.0.0.1:3001` | Use `page.goto('/')` |
| `gif-demo.spec.ts` | 5 | `http://localhost:3000` | Fix port + use relative |
| `pdp-happy.spec.ts` | 10 | API `http://127.0.0.1:8001` | Use env var |
| `debug-search.spec.ts` | 5 | `http://localhost:3000` | Fix port + use relative |
| `greek-simple.spec.ts` | 6,30 | `http://localhost:3000` | Fix port + use relative |
| `shipping-demo-simple.spec.ts` | 8,125 | `http://localhost:3001/cart` | Use `page.goto('/cart')` |
| `test-auth.ts` (helper) | 20 | Hardcoded API base | Already using env var ✅ |

### 2. Port Inconsistencies

**Critical Issue**: Mixed port usage across specs
- Some specs use `:3000` (incorrect)
- Some specs use `:3001` (correct for current setup)
- Some specs use `:127.0.0.1:3001` vs `localhost:3001`

**Fix**: Standardize all to use baseURL from playwright config

### 3. Text Selectors → Data-TestId Conversion

#### Cart Flow Selectors
| Current Selector | Required Data-TestId | Component |
|------------------|---------------------|-----------|
| `text=Your cart is empty` | `[data-testid="cart-empty"]` | Cart |
| `text=Are you sure` | `[data-testid="confirm-dialog"]` | Cart |
| `button:has-text("Add to Cart")` | `[data-testid="add-to-cart"]` | Product Card |
| `getByRole('button', { name: /add to cart/i })` | `[data-testid="add-to-cart"]` | Product Card |

#### Checkout Flow Selectors
| Current Selector | Required Data-TestId | Component |
|------------------|---------------------|-----------|
| `[data-testid="checkout-btn"]` | ✅ Already correct | Cart |
| `[data-testid="checkout-cta-btn"]` | ✅ Already correct | Cart |
| `text=Proceed to Checkout` | Use existing `[data-testid="checkout-btn"]` | Cart |
| `button:has-text("Ενημέρωση")` | `[data-testid="update-btn"]` | Checkout |

#### Greek Text Selectors (Low Priority)
| Current Selector | Status | Action |
|------------------|--------|--------|
| `text=Πορτοκάλια` | Greek product search | Keep (search functionality) |
| `text=Η πόλη δεν αντιστοιχεί` | Validation error | Keep (error text validation) |
| `text=εκτ.` | Shipping estimate | Add `[data-testid="shipping-estimate"]` |

### 4. ✅ Good Practices Already Present

**Components with proper data-testids:**
```typescript
// Cart components
'[data-testid="checkout-btn"]'
'[data-testid="checkout-cta-btn"]'
'[data-testid="cart-item"]'
'[data-testid="empty-cart-message"]'
'[data-testid="loading-spinner"]'
'[data-testid="cart-ready"]'

// Product components
'[data-testid="add-to-cart"]'
'[data-testid="product-card"]'

// Navigation
'[data-testid="user-menu"]'
'[data-testid="nav-user"]'
```

## 🎯 PRIORITIZED FIX LIST

### Phase 1: BaseURL Normalization (High Impact)
1. **Fix port inconsistencies**: Convert all `:3000` → `:3001` or use baseURL
2. **Convert page.goto() calls**: 26 instances to convert to relative paths
3. **Standardize API endpoints**: Use environment variables consistently

### Phase 2: Critical Selector Standardization (Medium Impact)
1. **Add missing data-testids** to product-card, cart-empty state
2. **Convert button text selectors** to data-testid for cart/checkout flows
3. **Standardize cart state selectors** across all specs

### Phase 3: Helper Integration (Low Impact)
1. **Create cart-ready helper** with stable wait conditions
2. **Update specs** to use helper for cart state verification

## 📋 FILES REQUIRING CHANGES

### High Priority (BaseURL fixes)
- `pr-pp03-d-checkout-edge-cases.spec.ts` (18 instances)
- `shipping-demo-simple.spec.ts` (2 instances)
- `greek-simple.spec.ts` (2 instances)
- `pr-pp03-b-search-evidence.spec.ts` (1 instance)

### Medium Priority (Components)
- `frontend/src/components/cart/` - Add missing data-testids
- `frontend/src/components/product-card/` - Ensure data-testid consistency
- `frontend/src/components/checkout/` - Verify existing testids

### Low Priority (Non-critical specs)
- Greek search specs (keep text selectors for search functionality)
- Demo specs (convert for consistency)

## 🚧 SCOPE LIMITATIONS

**Out of Scope for This PR:**
- Analytics specs (separate concern)
- Producer inventory specs (different workflow)
- Search functionality text selectors (business logic)
- Performance/accessibility specs (specialized testing)

**In Scope:**
- Cart flow critical path
- Checkout flow critical path
- Product card interactions
- BaseURL standardization across all specs

## 🎯 SUCCESS METRICS

**Before Fix:**
- 45 hardcoded URLs
- Mixed port usage (3000 vs 3001)
- Text-based selectors causing flakiness
- Inconsistent wait patterns

**After Fix:**
- 0 hardcoded URLs (all use baseURL)
- Consistent port configuration
- Stable data-testid selectors
- Unified cart-ready helper pattern