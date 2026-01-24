# Pass: CI-FLAKE-LOCALE-01

**Date (UTC):** 2026-01-21
**Commit:** TBD (pending PR merge)
**Environment:** CI E2E Tests

---

## Summary

Stabilized flaky `locale.spec.ts` Playwright test that was failing in CI due to React hydration timing issues.

---

## Root Cause

The test `locale cookie sets Greek when explicitly set` failed because:
1. Test navigated to `/auth/login`
2. Immediately checked for `getByTestId('page-title')`
3. In CI (slower environment), React hydration hadn't completed yet
4. Element not found, test failed

Error message:
```
Error: expect(locator).toContainText(expected) failed
Locator: getByTestId('page-title')
Expected string: "Σύνδεση"
Received: <element(s) not found>
```

---

## Fix Applied

### Test: `locale cookie sets Greek when explicitly set`

**Before:**
```typescript
await page.goto('/auth/login');
await expect(page.getByTestId('page-title')).toBeVisible({ timeout: 15000 });
await expect(page.getByTestId('page-title')).toContainText('Σύνδεση');
```

**After:**
```typescript
await page.goto('/auth/login', { waitUntil: 'networkidle' });
await expect(page.getByTestId('login-form')).toBeVisible({ timeout: 15000 });
await expect.poll(
  async () => {
    const title = page.getByTestId('page-title');
    const isVisible = await title.isVisible().catch(() => false);
    if (!isVisible) return '';
    return await title.textContent() || '';
  },
  { timeout: 10000, message: 'Waiting for Greek page title to render' }
).toContain('Σύνδεση');
```

### Test: `locale cookie is respected when set`

**Before:**
```typescript
await page.goto('/products');
await page.waitForTimeout(1500); // Fixed sleep - bad pattern
```

**After:**
```typescript
await page.goto('/products', { waitUntil: 'networkidle' });
await expect(page.getByTestId('search-input')).toBeVisible({ timeout: 15000 });
```

---

## Key Improvements

| Aspect | Before | After |
|--------|--------|-------|
| Navigation | Default `load` event | `networkidle` for stability |
| Element wait | Direct assertion on slow element | Wait for stable indicator first |
| Text assertion | `toContainText()` (fails if element missing) | `expect.poll()` with safe fallback |
| Fixed sleep | `waitForTimeout(1500)` | Removed, use element waits |

---

## Artifacts

- `frontend/tests/e2e/locale.spec.ts` — Stabilized test file
- PR: TBD

---

_Pass: CI-FLAKE-LOCALE-01 | Generated: 2026-01-21 | Author: Claude_
