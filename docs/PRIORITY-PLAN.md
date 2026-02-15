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
**Status:** `[ ]`

### A2: Production Smoke Test
**Why:** Verify ALL critical flows work end-to-end on production before inviting people.
**What:**
- [ ] Register as new consumer → verify email → login
- [ ] Browse products → add to cart → checkout → COD order
- [ ] Register as producer → complete onboarding form → wait for admin approval
- [ ] Admin approve producer → producer adds product → product visible in catalog
- [ ] Consumer buys producer's product → producer sees order in dashboard
- [ ] Leave a review on a purchased product
**Effort:** Manual testing, fix any blockers found
**Status:** `[ ]`

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

### B1: Homepage Trust Signals
**Why:** First impression. Producer and consumer must think "this is real."
**What:**
- "Πώς Λειτουργεί" section (3 steps: Παραγωγός → Προϊόν → Καταναλωτής)
- Trust badges below hero: "Ασφαλείς Πληρωμές", "Απευθείας από Παραγωγούς", "Ελληνικά Προϊόντα"
- Clean up hero section copy if needed
**Effort:** S-M (1-2 PRs, ~150 LOC)
**Status:** `[ ]`

### B2: Producer Dashboard Polish
**Why:** This is what producers will use daily. Must feel complete, not half-baked.
**What:**
- Verify dashboard stats load correctly (sales, orders, top products)
- Product list: ensure edit/delete/stock update work smoothly
- Orders list: status badges, customer info, total
- Mobile check: can a producer use their phone?
**Effort:** S-M (1-2 PRs if fixes needed)
**Status:** `[ ]`

### B3: Product Card & Detail Page Final Polish
**Why:** This is where buying decisions happen.
**What:**
- Verify star ratings display correctly (from S1-02)
- Cultivation type badges visible
- Price, stock, "Add to Cart" prominent
- Product images: fallback for missing images
- Mobile-responsive check
**Effort:** S (1 PR if fixes needed)
**Status:** `[ ]`

### B4: Producer Public Profile Page
**Why:** Producers want a page they can share. "Δες τα προϊόντα μου στο Dixis."
**What:**
- Verify /producers/[id] page works and looks good
- Producer name, location, description, products grid
- Shareable URL (for social media / business cards)
**Effort:** S (1 PR if fixes needed)
**Status:** `[ ]`

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
- [ ] Analytics live on production (we can see traffic)
- [ ] 3-5 real producers invited and onboarded
- [ ] At least 1 producer has added real products with real photos
- [ ] Platform visually polished enough to not embarrass us
- [ ] Zero critical bugs in producer/consumer flows
- [ ] Quick start guide ready for producers

---

## Summary

```
Day 1: Analytics + Smoke Test + Seed Cleanup + Start UI Polish
Day 2: UI Polish Sprint (homepage, dashboard, cards, producer page)
Day 3: Producer onboarding testing + fixes + INVITE REAL PRODUCERS
Day 3+: Monitor, collect feedback, fix what breaks
```

**The next feature we build should be the one our first real producer asks for.**
