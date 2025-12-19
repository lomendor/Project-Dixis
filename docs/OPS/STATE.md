# OPS STATE

**Last Updated**: 2025-12-19 17:20 UTC

## CLOSED ✅ (do not reopen without NEW proof)
- **SSH/fail2ban**: Canonical SSH config enforced (deploy user + dixis_prod_ed25519 key + IdentitiesOnly yes). fail2ban active with no ignoreip whitelist. Production access stable. (Closed: 2025-12-19)

## STABLE ✓ (working with evidence)
- **Backend health**: /api/healthz returns 200 ✅
- **Products API**: /api/v1/public/products returns 200 with data ✅
- **Products list page**: /products returns 200, renders product names (e.g., "Organic Tomatoes") ✅
- **Product detail page**: /products/1 returns 200, renders expected product content ✅
- **Auth redirects**: /login → /auth/login (307), /register → /auth/register (307) ✅
- **Auth pages**: /auth/login and /auth/register return 200 ✅

**Evidence**: See `docs/OPS/PROD-FACTS-LAST.md` (auto-updated by `scripts/prod-facts.sh`)

## IN PROGRESS → (WIP=1 ONLY)
- **WIP**: Bootstrap OPS state management system (this PR)
  - DoD: STATE.md + NEXT-7D.md + PROD-FACTS-LAST.md + prod-facts.sh committed and merged
  - Status: In PR review

## BLOCKED ⚠️
- (none)

## NEXT 📋 (max 3, ordered, each with DoD)

### 1) Data dependency roadmap documentation
- **DoD**:
  - Document created: `docs/PRODUCT/DATA-DEPENDENCY-MAP.md`
  - Defines current state of: Products → Producers → Permissions → Dashboard → Admin
  - Identifies missing pieces with priority order
  - Agreed upon by stakeholders

### 2) Producer dashboard permissions audit
- **DoD**:
  - Verify producers can ONLY edit their own products
  - Verify admin can override/edit any product
  - E2E test coverage for authorization rules
  - Document findings in `docs/FEATURES/PRODUCER-PERMISSIONS.md`

### 3) Checkout flow end-to-end verification
- **DoD**:
  - User can add products to cart (200 OK)
  - User can proceed through checkout (200 OK)
  - Order is created in backend
  - Confirmation email sent (or logged in dev mode)
  - Test with real product + shipping address

---

## How to Use This System

### Before Starting Any Work
```bash
# 1. Rehydrate: Check current state
cat docs/OPS/STATE.md

# 2. Run PROD facts
./scripts/prod-facts.sh

# 3. Read PROD-FACTS-LAST.md to see current reality
cat docs/OPS/PROD-FACTS-LAST.md

# 4. Check NEXT-7D to see WIP item
cat docs/NEXT-7D.md
```

### After Completing Work
```bash
# Update STATE.md:
# - Move completed item from IN PROGRESS to STABLE
# - Add new item to IN PROGRESS (WIP=1 only)
# - Update NEXT list if priorities changed

# Update NEXT-7D.md:
# - Move completed item to DONE
# - Update WIP to next item
```

### Rule: WIP Limit = 1
Only ONE item can be "IN PROGRESS" at any time. This prevents context switching and ensures completion.
