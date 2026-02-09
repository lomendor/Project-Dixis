# Pass ADMIN-CLEANUP-01 — Admin Code Cleanup + i18n Completion

**Date**: 2026-02-09
**Status**: ✅ DONE
**PRs**: #2694, #2695, #2696, #2698

---

## What was done

### PR #2694 — Deploy infrastructure
- Created `frontend/ecosystem.config.js` (PM2 config committed to repo)
- Fixed `scripts/prod-deploy-clean.sh` PM2 restart path
- Committed QA report and updated AGENT-STATE.md

### PR #2695 — Admin i18n sweep (6 files)
- Translated ~30 English strings across AdminSidebar, admin/page, orders/[id]/page, categories/page, AnalyticsContent, users/page
- Added Greek `labels` map to StatusBadge component

### PR #2696 — Admin code cleanup (3 fixes)
- Removed duplicate SkeletonRow in AdminOrdersMain (was nested inside `go()`)
- Switched from deprecated `/api/v1/admin/orders` to `/api/admin/orders` (Next.js proxy)
- Added `window.confirm()` dialog before product approval in moderation

### PR #2698 — AnalyticsDashboard i18n
- Translated 25+ English strings in AnalyticsDashboard.tsx (chart titles, KPIs, table headers, error messages)
- Removed unused `Link` import from admin/customers/page.tsx

---

## Verification

| Check | Result |
|-------|--------|
| Production healthz | ✅ SHA `4f4eb217`, status ok |
| Admin i18n (11 files scanned) | ✅ 11/11 PASS — zero English user-facing strings |
| Deprecated `/api/v1/admin/orders` | ✅ 0 occurrences in codebase |
| SkeletonRow duplicate | ✅ Only 1 definition (line 301) |
| Approve confirm dialog | ✅ Present (moderation/page.tsx line 159) |
| CI | ✅ All checks pass on all 4 PRs |

---

## Files changed

| PR | Files | Insertions | Deletions |
|----|-------|-----------|-----------|
| #2694 | 3 | ~45 | ~5 |
| #2695 | 6 | ~40 | ~30 |
| #2696 | 2 | 19 | 17 |
| #2698 | 3 | 33 | 33 |

---

## Remaining (low priority)

- Error handling gaps in `products/page.tsx` (silent loadProducts/loadProducers failures)
- Missing pagination on customers/users pages
- localStorage auth token fallback in AdminOrdersMain (works but could be cookies-only)
