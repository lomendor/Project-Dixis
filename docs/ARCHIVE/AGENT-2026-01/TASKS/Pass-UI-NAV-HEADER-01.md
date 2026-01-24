# TASK — Pass UI-NAV-HEADER-01

## Goal

Fix header/navbar IA so that:
- Logo always visible (guest + logged-in)
- No dev/test links (Απαγορεύεται)
- Clean, predictable menu by user state and role
- E2E tests to lock expectations
- Product doc describing header rules

## Scope

Navigation UI + tests + docs only. No business logic changes.

## Deliverables

### UI Changes

- [x] Removed "Απαγορεύεται" link from navLinks (was using `t('errors.forbidden')`)
- [x] Renamed "Αριθμός παραγγελίας" → "Παρακολούθηση παραγγελίας" in nav
- [x] Added `data-testid="nav-logo"` to logo link
- [x] Added translation keys `nav.trackOrder` (EL/EN)

### Tests

- [x] Created `frontend/tests/e2e/header-nav.spec.ts`
  - Guest: logo visible, login/register visible, "Απαγορεύεται" NOT visible
  - Logged-in: logo visible, logout visible, login/register NOT visible
  - Role extras: producer dashboard, admin links

### Documentation

- [x] Created `docs/PRODUCT/HEADER-NAV-V1.md` with full nav rules
- [x] Updated STATE.md + NEXT-7D.md

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/components/layout/Header.tsx` | Removed forbidden link, added logo testid |
| `frontend/messages/el.json` | Added `nav.trackOrder` |
| `frontend/messages/en.json` | Added `nav.trackOrder` |
| `frontend/tests/e2e/header-nav.spec.ts` | NEW - E2E tests |
| `docs/PRODUCT/HEADER-NAV-V1.md` | NEW - Nav rules doc |

## DoD

- [x] Logo visible in all states
- [x] "Απαγορεύεται" removed from nav
- [x] E2E tests created
- [x] Product doc created
- [x] PR created + CI green
- [x] Merged

## Result

**PASS** — Header navigation fixed per spec.
