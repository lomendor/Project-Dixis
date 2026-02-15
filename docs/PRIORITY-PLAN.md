# Dixis — Priority Plan: Producer Launch Prep

**Created:** 2026-02-15
**Deadline:** 3 days (producers go live 2026-02-18)
**Philosophy:** Stop building features nobody asked for. Prepare the platform for REAL producers.

---

## Context

We have a technically solid MVP+ with working:
- Customer flow (register, browse, cart, checkout, Stripe/COD, order tracking)
- Producer flow (register, onboarding, approval, add products, see orders)
- Admin flow (manage orders, producers, products, analytics)
- Trust features: Reviews, Cultivation Types, Verified Purchase badges

**What's missing:** Real producers, real products, real orders, real data to guide decisions.

**Strategy shift:** Instead of continuing the feature backlog (S1-03 Q&A, S1-04 Wishlist, etc.), we focus on making the existing platform rock-solid for the first real users.

---

## Phase A: Technical Foundations (Today)

> Things that MUST work before real producers touch the platform.

### A1: Analytics Activation (Plausible)
**Why:** Without analytics, we're blind. We need to know what real users do.
**What:** Set `NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible` + `NEXT_PUBLIC_ANALYTICS_DOMAIN=dixis.gr` on production. The `<Analytics>` component already exists in `layout.tsx` — just needs env vars.
**Pre-req:** Plausible account (plausible.io — free trial or self-host)
**Effort:** Config only (0 LOC)
**Status:** `[~]` CSP ready (PR #2916). **Owner task:** create Plausible account + set env vars on VPS.

### A2: Production Smoke Test
**Why:** Verify ALL critical flows work end-to-end on production before inviting people.
**What:**
- [x] All pages load (200 OK, <0.3s response times)
- [x] API health: DB connected, Stripe configured, Email (Resend) configured
- [x] 15 products visible in catalog
- [ ] Register as new consumer → verify email → login
- [ ] Browse products → add to cart → checkout → COD order
- [ ] Register as producer → complete onboarding form → wait for admin approval
- [ ] Admin approve producer → producer adds product → product visible in catalog
- [ ] Consumer buys producer's product → producer sees order in dashboard
- [ ] Leave a review on a purchased product
**Effort:** Manual testing, fix any blockers found
**Status:** `[~]` Infrastructure verified. Manual user-flow testing pending (owner task).
**Note:** `/api/categories` returns 500 (Prisma connection issue on VPS) — product forms may not show category dropdown. Needs investigation.

### A3: Seed Data Cleanup
**Why:** When real producers arrive, they'll see dummy data alongside their real products. That looks unprofessional.
**What:**
- Review current seed producers/products — keep 2-3 as demo, remove the rest OR mark as hidden
- Ensure categories make sense for real Greek products
- Verify product images aren't broken
**Effort:** S (1 PR, ~50 LOC)
**Status:** `[ ]`

---

## Phase B: UI Polish Sprint (Day 1-2)

> Make the platform look professional enough for producers to take it seriously.

### B1: Homepage Trust Signals ✅
**Status:** `[x]` Done — PR #2915 deployed.
- "Πώς Λειτουργεί" 3-step section added
- Trust badges (Ασφαλείς Πληρωμές, Απευθείας από Παραγωγούς, 100% Ελληνικά)
- Empty state polished with smart CTA (clear filters vs refresh)

### B2: Producer Dashboard + All Producer Pages Polish ✅
**Status:** `[x]` Done — PRs #2918, #2920 deployed.
- Dashboard brand colors unified (neutral/primary palette)
- All 9 producer-facing pages unified: onboarding, orders, order detail, settings, analytics, products, create, edit, error

### B3: Product Card & Detail Page ✅
**Status:** `[x]` Verified — already compliant.
- Star ratings display correctly (StarRating component)
- Cultivation type badges visible with descriptive labels
- Price, stock, "Add to Cart" prominent
- Product images: proper fallback placeholder
- Mobile-responsive grid layout
- Brand colors already correct (neutral/primary)

### B4: Producer Public Profile Page ✅
**Status:** `[x]` Done — PR #2921 deployed.
- Brand colors unified (gray→neutral)
- Producer name, location, description, products grid all working
- Shareable URL functional (/producers/[slug])

### B5: Consumer Pages Polish ✅ (added)
**Status:** `[x]` Done — PR #2921 deployed.
- Account orders, order detail, producers listing brand-unified
- Contact, FAQ, order lookup, 404, error pages brand-unified
- Cart and checkout were already compliant

---

## Phase C: Producer Onboarding Readiness (Day 2-3)

> Everything a producer needs to go from "I heard about Dixis" to "My products are live."

### C1: Producer Registration Flow Test
**Why:** This WILL be the first thing producers do. It must be flawless.
**What:**
- Test full flow: register → onboarding form → admin approval → first product → live
- Verify email notifications at each step
- Error messages clear and in Greek
- Mobile-friendly forms
**Effort:** Testing + fixes
**Status:** `[ ]`

### C2: Product Upload UX
**Why:** Producers will add products. This must be straightforward.
**What:**
- Product form: name, description, price, stock, category, cultivation type, image upload
- Verify all fields save correctly to Laravel
- Image upload: works? reasonable file size limits?
- Preview before publish?
**Effort:** S-M (fixes if needed)
**Status:** `[ ]`

### C3: Quick Start Guide Content
**Why:** Producers need a "what do I do first?" guide.
**What:** (NON-CODE — for the business owner)
- Write a simple 1-page guide: "Ξεκινήστε στο Dixis σε 5 λεπτά"
  1. Εγγραφή
  2. Συμπληρώστε το προφίλ σας
  3. Προσθέστε τα προϊόντα σας
  4. Δεχτείτε παραγγελίες
- Can be a Google Doc, PDF, or even a WhatsApp message template
**Status:** `[ ]` (Owner task)

---

## Phase D: Post-Launch Monitoring (Day 3+)

> After producers are in, watch and react.

### D1: Monitor Analytics
- What pages do producers visit?
- Do they complete product upload?
- Where do they get stuck?

### D2: Collect Feedback
- Direct conversations with first 3-5 producers
- What's confusing? What's missing? What would help?
- This feedback = our REAL backlog

### D3: Fix What Breaks
- Expect bugs with real data (edge cases we never tested)
- Prioritize: anything that blocks producers from adding products or consumers from buying

---

## What We're NOT Doing (Consciously)

These are deferred until we have real user data:

| Deferred | Why |
|----------|-----|
| S1-03 Q&A | No products to ask questions about yet |
| S1-04 Wishlist | No returning users yet |
| S1-05 Certifications | Let producers ask for it first |
| S2-01 Homepage Redesign | Current homepage is functional enough |
| S3-03 Cart Abandonment | Need cart activity first |
| S4-02 Adopt-a-Tree | Amazing feature, but premature |
| Viva Wallet | Stripe + COD covers 90% of Greek payments |

**Rule:** No new features until we have at least 5 real producers and 10 real orders.

---

## Success Criteria

By end of Day 3:
- [~] Analytics live on production — CSP ready, needs Plausible account + env vars (owner task)
- [ ] 3-5 real producers invited and onboarded
- [ ] At least 1 producer has added real products with real photos
- [x] Platform visually polished enough to not embarrass us (6 PRs deployed)
- [~] Zero critical bugs in producer/consumer flows — pages load, APIs work, manual flow test pending
- [ ] Quick start guide ready for producers (owner task)

---

## Summary

```
Day 1: ✅ Analytics CSP + UI Polish (homepage, dashboard, all producer pages, all consumer pages)
Day 2: Manual flow testing + Seed cleanup + Plausible activation (owner)
Day 3: Producer onboarding testing + fixes + INVITE REAL PRODUCERS
Day 3+: Monitor, collect feedback, fix what breaks
```

## PRs Delivered (Day 1)
| PR | What | LOC |
|----|------|-----|
| #2914 | Priority Plan docs | docs only |
| #2915 | Homepage trust section (How It Works + badges) | 86 |
| #2916 | CSP for Plausible Analytics | 4 |
| #2918 | Producer dashboard brand palette | 94 |
| #2920 | All producer/my pages brand palette (9 files) | 474 |
| #2921 | All consumer pages brand palette (10 files) | 278 |

**The next feature we build should be the one our first real producer asks for.**
