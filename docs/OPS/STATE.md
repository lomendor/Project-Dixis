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
