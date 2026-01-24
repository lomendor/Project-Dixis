# PLAN — Pass UI-HEADER-NAV-02

**Created:** 2026-01-21
**Author:** Claude (Release Lead)
**Status:** COMPLETE

---

## Goal

1. Ensure logo (home button) visible ALWAYS (guest + logged-in) in desktop & mobile, linking to "/"
2. Remove "Παρακολούθηση παραγγελίας" from top nav entirely
3. Update E2E tests to catch any regressions
4. Update mini-spec (HEADER-NAV-V1.md) with clear nav rules by role

---

## Non-Goals

- No business logic changes
- No new features
- No API changes
- No styling overhaul

---

## Findings

### Logo Visibility

The logo in `Header.tsx:39` is rendered **unconditionally** at the top level:
```tsx
<Link href="/" ... data-testid="nav-logo">
  <Logo height={28} title="Dixis" />
</Link>
```

This is **correct** — the logo is visible for both guest and logged-in users. No fix needed.

### Track Order Link

Currently in `navLinks` array (line 17-21):
```tsx
const navLinks = [
  { href: '/products', label: t('nav.products') },
  { href: '/orders/lookup', label: t('nav.trackOrder') },  // <-- REMOVE THIS
  { href: '/producers', label: t('producers.title') },
];
```

**Fix:** Remove the Track Order entry. Users can still access `/orders/lookup` directly or via footer.

---

## Changes

| File | Change |
|------|--------|
| `Header.tsx` | Remove Track Order from navLinks |
| `header-nav.spec.ts` | Remove Track Order assertion, add NOT visible test |
| `HEADER-NAV-V1.md` | Update spec to remove Track Order from role tables |

---

## DoD

- [x] Logo verified as always visible
- [x] Track Order removed from navLinks
- [x] E2E tests updated
- [x] Mini-spec updated
- [x] Build passes
- [x] PR created + CI green
- [x] Merged

---

## Evidence

- Build: PASS
- PR: #2372 (merged)
- Commit: 18e19441

---

_Plan: UI-HEADER-NAV-02 | Created: 2026-01-21_
