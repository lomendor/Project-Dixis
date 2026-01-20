# Pass USER-FEEDBACK-LOOP-01 — Simple Feedback Loop

**Status**: IN_PROGRESS
**Priority**: P2 (Post-V1 Iteration)
**Estimated LOC**: ~10

---

## Objective

Enable early users to easily send feedback to the Dixis team, without introducing backend complexity.

---

## Requirements

1. **Minimal scope**: Use existing infrastructure, no new DB tables
2. **Globally visible**: Feedback link accessible from every page (footer)
3. **EL-first**: Greek copy as primary language
4. **Privacy-friendly**: No tracking, just simple form submission

---

## Implementation

### Discovery

Found existing contact system already in place:
- **Page**: `/contact` (`frontend/src/app/contact/page.tsx`)
- **API**: `/api/contact` (`frontend/src/app/api/contact/route.ts`)

Features already implemented:
- Greek UI with form (name, email, message)
- Zod validation
- Rate limiting (10 req/10 min per IP)
- Honeypot spam protection
- Email to `ADMIN_EMAIL` or `info@dixis.gr`
- Auto-reply to sender

### Gap Identified

The `/contact` page exists but was **not linked in the footer**, making it hard for users to discover.

### Fix Applied

Added "Επικοινωνία / Σχόλια" link to footer, pointing to existing `/contact` page.

**File**: `frontend/src/components/layout/Footer.tsx`
**Line**: 51

```tsx
<Link href="/contact" className="py-2 text-sm text-neutral-600 hover:text-primary active:text-primary transition-colors touch-manipulation">
  Επικοινωνία / Σχόλια
</Link>
```

---

## Acceptance Criteria

- [x] Feedback link visible in footer on all pages
- [x] Link points to existing `/contact` page
- [x] Greek copy ("Επικοινωνία / Σχόλια")
- [x] No new backend complexity
- [x] Build passes

---

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/components/layout/Footer.tsx` | MODIFIED (+5 lines) |

---

## Existing Infrastructure (No Changes Needed)

| Component | Path | Description |
|-----------|------|-------------|
| Contact Page | `frontend/src/app/contact/page.tsx` | Form with states |
| Contact API | `frontend/src/app/api/contact/route.ts` | Rate-limited, validated |
| Email Service | `frontend/src/lib/mail.ts` | Resend integration |

---

_Created: 2026-01-20 | Author: Claude_
