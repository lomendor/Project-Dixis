# Dixis — STATE log

## Pass 101 — Producer profile polish
- Hero image + EL CTA + breadcrumbs; list card LCP tweaks; tests.

## Pass 102 — Phone-first OTP (dev stub)
- OTP API, EL pages, sessions, tests.

## Pass 103 — Producer onboarding (session-based)
- /api/me/* endpoints; /onboarding wizard (EL); tests green.

## Pass 104 — RBAC (Admin vs Producer)
- Session role field; requireRole() helper; admin endpoints; auto-upgrade.

## Pass 105 — Products (producer-owned)
- Prisma model + public read + /my/products UI + tests.

## Pass 106 — Orders (cart+checkout)
- Checkout API; buyer orders & producer sales; stock decrement; EL UI; tests.

## Pass 106b — Orders CI finalized
- Checkout test already in frontend/tests; CI runs full suite via e2e-full workflow.

## Pass 106c — PR tests & UX
- PR workflow τρέχει ολόκληρο το `frontend/tests` μέσω `scripts/ci/run-playwright.sh`
- Προστέθηκε `/my/orders` (λίστα παραγγελιών)
- Ενοποίηση docs paths σε OPS

## Pass 106d — Docs canonicalize + CI verify + UX link
- Canonical docs folder: `docs/OPS/` (αφαίρεση `docs/ops`/duplicates)
- Επιβεβαίωση ότι το PR workflow καλεί `scripts/ci/run-playwright.sh`
- Προστέθηκαν links σε `/my` → «Οι παραγγελίες μου» & «Τα προϊόντα μου»

## Pass 107a — UX hotfix
- Μετατροπή header παραγωγού σε client component
- Αξιόπιστο share/copy (navigator.share + clipboard fallback)
- Βελτίωση CSV download (πρόσθετο attr)

## Pass 107b — Cart/Checkout UX polish
- `/cart-simple`: Stock validation, qty clamping, overstock warnings
- 401 redirect σε `/join?next=/cart-simple`
- Loading spinner «Προετοιμασία…» κατά το submit
- `/orders-simple/[id]`: Copy button + «Οι παραγγελίες μου» link
- Playwright tests: empty cart, overstock, 401, checkout flow (7 scenarios)

## Pass 107b.1 — Port to main routes + tests consolidation
- Ported improvements από -simple → main routes (`/cart`, `/orders/[id]`)
- `/cart`: submitting state, 401 handling, enhanced error handling
- `/orders/[id]`: copy button, nav link, button group layout
- Tests moved to `frontend/tests/cart/`, paths updated to main routes
- Αφαίρεση -simple pages (single implementation, no duplication)

## Pass 108 — Order lifecycle (per-item status)
- OrderItemStatus enum: PLACED, ACCEPTED, FULFILLED, REJECTED, CANCELLED
- Producer actions: ACCEPT/REJECT (PLACED), FULFILL (ACCEPTED), stock returns on REJECT
- Buyer cancel: POST /api/me/orders/[id], only when all items PLACED, stock returns
- Order status recalc: all rejected/cancelled → CANCELLED
- UI: `/my/sales` (producer actions), `/orders/[id]` (status badges + cancel button)
- Dev notifications (JSON files → .tmp/mails/)
- Playwright tests: ACCEPT/REJECT/FULFILL, buyer cancel, stock returns (7 scenarios)
