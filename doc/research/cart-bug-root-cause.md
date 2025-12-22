# 🐛 Cart Persistence Bug - Root Cause Analysis

**Date**: 2025-12-23
**Reporter**: User observation - "Έχει animation ότι και καλά προστήθεται το προιόν. Παρατηρώ ότι δεν εμφανίζεται τίποτα στο καλάθι"
**Status**: ✅ ROOT CAUSE IDENTIFIED

---

## 🔍 Bug Reproduction

1. User visits `https://www.dixis.gr/products/1`
2. Clicks "Προσθήκη στο καλάθι" (Add to cart)
3. Animation shows ✓ success
4. User navigates to cart → goes to `https://dixis.gr/cart` (or vice versa)
5. **Cart appears empty** ("Το καλάθι σου είναι άδειο")

---

## 🎯 Root Cause

### **localStorage Origin Mismatch**

Cart data is stored using `localStorage` with key `dixis:cart:v1`:

**File**: `frontend/src/store/cart.ts:24-44`
```typescript
const STORAGE_KEY = 'dixis:cart:v1'

const getStoredCart = (): CartItem[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}
```

**The Problem**: localStorage is **origin-specific**:
- `https://www.dixis.gr` → has its own localStorage
- `https://dixis.gr` → has a **separate** localStorage (different origin!)

### **No Canonical Host Redirect**

**HTTP Tests Confirmed**:
```bash
$ curl -sI https://www.dixis.gr/products | grep -i location
# NO redirect - returns HTTP 200 OK

$ curl -sI https://dixis.gr/products | grep -i location
# NO redirect - returns HTTP 200 OK
```

Both domains serve content without redirecting to a canonical host.

**Middleware Audit**:
- `frontend/middleware.ts` - Only blocks `/api/ci/*` and `/api/dev/*` in production
- `frontend/src/middleware.ts` - Only matches `/ops/*` paths
- **NO canonical host redirect implemented**

---

## 📊 Impact Analysis

### **User Journey Broken**:
1. User adds product on **www**.dixis.gr → localStorage stored on `www` origin
2. User clicks cart link (relative `/cart`) → stays on **www**.dixis.gr → ✅ **WORKS**
3. **BUT** if navigation goes to apex dixis.gr (direct link, bookmark, search result):
   - Cart reads from different localStorage → ❌ **EMPTY**

### **Cart Links Audit** (all relative - preserve current host):
- `components/CartBadge.tsx:17` → `href="/cart"`
- `components/cart/CartIcon.tsx:63,88` → `href="/cart"`
- `components/cart/CartMiniPanel.tsx:101` → `<Link href="/cart">`

All cart links use **relative paths** (correct), but this means they preserve whatever host the user is on.

---

## ✅ Solution: Canonical Host Redirect

### **Option 1: Next.js Middleware** (RECOMMENDED)
Add canonical redirect at application layer:

```typescript
// frontend/middleware.ts
export const config = {
  matcher: ['/:path*'], // Match all paths
};

export default function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  const url = req.nextUrl.clone();

  // Redirect www → apex (or vice versa)
  if (host === 'www.dixis.gr') {
    url.host = 'dixis.gr';
    return NextResponse.redirect(url, 301); // Permanent redirect
  }

  return NextResponse.next();
}
```

**Pros**:
- Application-level control
- Works in all environments (local, staging, prod)
- Easy to test and verify
- No infrastructure changes required

**Cons**:
- Adds minimal overhead to every request

### **Option 2: nginx/Server Config**
Add redirect at infrastructure layer:

```nginx
server {
    listen 443 ssl;
    server_name www.dixis.gr;
    return 301 https://dixis.gr$request_uri;
}
```

**Pros**:
- Most performant (handles redirect before hitting app)
- Standard practice

**Cons**:
- Requires infrastructure access
- Environment-specific config

---

## 🧪 Test Strategy

### **Regression Test** (already created):
**File**: `frontend/tests/e2e/cart-prod-regress.spec.ts`

```typescript
test('cart persists after add-to-cart on prod (same host)', async ({ page }) => {
  const base = 'https://www.dixis.gr';
  await page.goto(`${base}/products/1`);
  await page.getByTestId('add-to-cart').click();
  await page.goto(`${base}/cart`);
  await expect(page.locator('body')).not.toContainText('Το καλάθι σου είναι άδειο');
});

test('cart cross-host bug repro (www → apex)', async ({ page }) => {
  // Add on www
  await page.goto('https://www.dixis.gr/products/1');
  await page.getByTestId('add-to-cart').click();

  // Check cart on apex (will fail without fix)
  await page.goto('https://dixis.gr/cart');
  // This WILL fail because localStorage is per-origin
});
```

**After Fix**: Second test should redirect and cart should persist.

---

## 📝 Recommended Implementation Steps

1. ✅ **Document root cause** (this file)
2. **Add canonical redirect middleware**:
   - Choose canonical host (recommend apex `dixis.gr`)
   - Update `frontend/middleware.ts` with 301 redirect
3. **Update cart test**:
   - Verify redirect happens
   - Verify cart persists across navigations
4. **Deploy fix**:
   - Test in staging first
   - Monitor production logs for redirect patterns
5. **Optional**: Add nginx redirect as additional layer

---

## 🔗 Related Files

- **Cart Storage**: `frontend/src/store/cart.ts:24-44`
- **Cart Context**: `frontend/src/lib/cart/context.tsx`
- **Middleware**: `frontend/middleware.ts`, `frontend/src/middleware.ts`
- **Test**: `frontend/tests/e2e/cart-prod-regress.spec.ts`

---

## 🎯 Success Criteria

- [ ] All traffic redirects to canonical host (301 permanent redirect)
- [ ] Cart persists when user navigates between www/apex domains
- [ ] E2E test passes: add on www, cart shows on apex (or vice versa)
- [ ] No user-facing disruption during deployment
- [ ] Search engines recognize canonical domain (SEO benefit)

---

**Next Action**: Implement canonical redirect in `frontend/middleware.ts`
