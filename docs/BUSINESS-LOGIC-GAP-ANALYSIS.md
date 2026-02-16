# Dixis — Business Logic Gap Analysis

**Created:** 2026-02-16
**Purpose:** Complete gap analysis between PRD vision and current implementation for commissions, payouts, and B2B.

---

## Executive Summary

The platform has a **solid B2C consumer experience** (browse, cart, checkout, Stripe/COD, order tracking). However, the **revenue engine** (how Dixis makes money) is almost entirely unimplemented:

| System | Code Exists | Wired to Checkout | Active in Prod | Admin UI |
|--------|:-----------:|:-----------------:|:--------------:|:--------:|
| Commission Calculation | Yes | **NO** | **NO** (flag OFF) | **NO** |
| Commission Records | Yes (model) | **NO** (never written) | **NO** | **NO** |
| Producer Payouts | Partial (fields) | **NO** | **NO** | **NO** |
| Settlement Reports | Yes (model) | **NO** (never written) | **NO** | **NO** |
| B2B Registration | **NO** | N/A | **NO** | **NO** |
| B2B Subscriptions | **NO** | N/A | **NO** | **NO** |
| Wholesale Pricing | **NO** | N/A | **NO** | **NO** |
| Invoice Generation | **NO** | N/A | **NO** | **NO** |

**Bottom line:** Every order placed today generates **zero commission records** and has **no mechanism** for paying producers. We're operating a marketplace without a revenue model implementation.

---

## 1. Commission System

### What EXISTS (infrastructure only)

| Component | Location | Status |
|-----------|----------|--------|
| `CommissionService` | `backend/app/Services/CommissionService.php` | Built, sophisticated rule resolution |
| `CommissionRule` model | `backend/app/Models/CommissionRule.php` | Built with scoping + tiers |
| `Commission` model | `backend/app/Models/Commission.php` | Built but **never written to** |
| `CommissionSettlement` model | `backend/app/Models/CommissionSettlement.php` | Built but **never written to** |
| Feature flag | `commission_engine_v1` via Laravel Pennant | Defaults to **OFF** |
| Default rules (seeded) | `CommissionRuleSeeder.php` | B2C 12%, B2B 7%, B2C volume 10% |
| `FeeResolver` (legacy) | `backend/app/Services/FeeResolver.php` | Parallel system, reads fee_rules table |
| Preview endpoint | `OrderCommissionPreviewController` | Returns 0 when flag OFF |

**How CommissionService works (when flag would be ON):**
1. Receives an Order
2. Resolves matching rule (channel + producer + category + amount tier + priority)
3. Calculates: `base = (order_amount x percent%) + fixed_fee_cents`
4. Applies VAT mode (INCLUDE = x1.24 for 24% FPA)
5. Applies rounding (UP/DOWN/NEAREST)
6. Returns `{ commission_cents, rule_id, breakdown }`

### What's MISSING

1. **Commission NOT wired to checkout** — `CheckoutService::processCheckout()` creates Orders but NEVER calls `CommissionService`. No Commission record is ever created.

2. **Feature flag is OFF** — Even if wired, returns 0 in production.

3. **No admin UI** for commission rules — Rules can only be managed via database/seeder. No CRUD interface.

4. **No producer-facing display** — Producers don't see commission breakdown on their orders.

5. **No cost transparency UI** (S3-01 in backlog) — Consumers don't see fee breakdown.

### What needs to happen

| Step | What | Effort | Priority |
|------|------|--------|----------|
| COMM-01 | Wire CommissionService into CheckoutService (after order creation, create Commission record per order) | S (~50 LOC) | **CRITICAL** |
| COMM-02 | Activate feature flag on production (`Feature::activate('commission_engine_v1')`) | Config only | **CRITICAL** |
| COMM-03 | Admin UI: list/create/edit/toggle commission rules | M (~150 LOC) | HIGH |
| COMM-04 | Producer dashboard: show commission breakdown per order in order detail | S (~80 LOC) | HIGH |
| COMM-05 | Cost transparency on product page (consumer sees "producer gets X%") | S (~60 LOC) | MEDIUM |

### Design Questions for Owner

1. **Do we want 12% B2C or a different rate?** The seeded default is 12%. Is this confirmed?
2. **VAT on commission?** Currently configured as INCLUDE mode (24% FPA added on top). The producer pays VAT on the platform fee. Correct?
3. **Volume discounts?** We have a rule for B2C 10% on orders > 100 EUR. Do we want this?
4. **Per-producer overrides?** The system supports producer-specific rates. Do we want to offer this at launch?
5. **Commission on shipping?** Currently commission is calculated on order subtotal only. Should it include shipping?

---

## 2. Producer Payouts

### What EXISTS

| Component | Status |
|-----------|--------|
| `Commission.producer_payout` field | Calculated: `order_gross - platform_fee - platform_fee_vat` |
| `CommissionSettlement` table | Schema exists: `producer_id, period_start, period_end, total_sales_cents, commission_cents, status` |
| Settlement statuses | PENDING, PAID, CANCELLED |

**That's ALL.** No actual payout mechanism exists.

### What's COMPLETELY MISSING

1. **No Stripe Connect** — No connected accounts, no automated transfers
2. **No manual payout workflow** — No admin interface to initiate bank transfers
3. **No producer bank account storage** — Producers have no way to enter IBAN
4. **No disbursement schedule** — No automated weekly/monthly payout cycle
5. **No payout history** — Producers can't see past payouts
6. **No settlement generation** — Settlement records are never created
7. **No payout receipts/invoices** — No documents for tax purposes

### Options

| Option | Pros | Cons | Timeline |
|--------|------|------|----------|
| **A) Stripe Connect** | Automated, secure, handles KYC | Complex setup, each producer needs Stripe onboarding, fees | 4-6 weeks |
| **B) Manual bank transfers** | Simple to start, no producer onboarding | Admin-heavy, error-prone, manual reconciliation | 1-2 weeks |
| **C) Hybrid (recommended)** | Start with manual, migrate to automated | Best of both worlds | 1-2 weeks to start, ongoing migration |

### Recommended Implementation (Hybrid approach)

| Step | What | Effort | Priority |
|------|------|--------|----------|
| PAYOUT-01 | Add IBAN field to Producer model + onboarding form | S (~30 LOC) | **CRITICAL** |
| PAYOUT-02 | Settlement generation: cron/artisan command that creates settlement records per producer per period | M (~100 LOC) | **CRITICAL** |
| PAYOUT-03 | Admin settlement dashboard: view pending settlements, total per producer, mark as "paid" | M (~150 LOC) | **CRITICAL** |
| PAYOUT-04 | Producer payout history page: list of settlements with status | S (~80 LOC) | HIGH |
| PAYOUT-05 | Settlement export to CSV/PDF (for admin bank transfer batch) | S (~60 LOC) | HIGH |
| PAYOUT-06 | (Future) Stripe Connect integration for automated payouts | XL (~500+ LOC) | LOW (when volume justifies) |

### Design Questions for Owner

1. **Payout frequency?** Weekly? Bi-weekly? Monthly? On-demand?
2. **Minimum payout threshold?** E.g., no payout under 20 EUR (accumulates to next period).
3. **Payout hold period?** How many days after order before funds are eligible for payout? (e.g., 7 days after delivery to handle refunds/disputes)
4. **Producer IBAN collection** — During onboarding or later? Required before first payout?
5. **Tax documents** — Do producers need to receive a formal statement for their accountant? Monthly or per-settlement?

---

## 3. B2B / Wholesale (Businesses buying from producers)

### What EXISTS

| Component | Status |
|-----------|--------|
| `Order.channel` field | 'b2c' or 'b2b' — exists but always 'b2c' |
| `CommissionRule.scope_channel` | Supports B2B-specific commission (7% seeded) |
| PRD data model docs | Businesses, Subscriptions, Subscription_Plans table schemas |
| Backlog tickets | S5-01 through S5-04 (Stage 5) |

### What's COMPLETELY MISSING (everything else)

| Missing Component | PRD Requirement |
|-------------------|-----------------|
| "Business" user role | PRD: separate registration + verification |
| `businesses` table | Fields: name, tax_id (AFM), tax_office (DOY), business_type, verified |
| `subscriptions` table | subscriber_id, plan_id, status, start/end dates, auto_renew |
| `subscription_plans` table | name, price, billing_cycle, commission_rate, features |
| B2B registration UI | Business name, AFM, DOY, documents upload |
| Admin business verification | Document review + approval workflow |
| Wholesale pricing per product | Producer sets separate B2B price |
| Bulk ordering | CSV import (SKU + quantity) |
| Recurring order templates | Weekly/monthly auto-orders |
| Multiple delivery addresses | Per-business delivery points |
| Stripe subscription billing | Monthly/annual plan payments |
| B2B invoice generation | Greek tax invoices with AFM |
| B2B analytics/reporting | Purchase history, spending reports |

### PRD Subscription Tiers

| Tier | Annual Price | Commission Rate | Benefits |
|------|-------------|-----------------|----------|
| Basic | 80-120 EUR/yr | Standard (7%) | Access to marketplace, basic ordering |
| Pro | 200-300 EUR/yr | Reduced | Priority shipping, bulk ordering, analytics |
| Premium | 500-1000 EUR/yr | **0%** | All benefits, dedicated support, API access |

### Recommended Phasing

**This is the largest scope item. Full B2B is ~15-20 PRs (4-8 weeks).**

| Phase | What | PRs | Effort |
|-------|------|-----|--------|
| **B2B-Phase-1** | Business role + registration + admin approval | 3 | M |
| **B2B-Phase-2** | Subscription plans table + Stripe billing + management UI | 5 | L |
| **B2B-Phase-3** | Wholesale pricing (producer sets B2B price per product) | 3 | M |
| **B2B-Phase-4** | Bulk ordering (CSV import) + recurring orders | 5 | L |
| **B2B-Phase-5** | Invoice generation + B2B analytics | 4 | M |

### Design Questions for Owner

1. **Do we need B2B for launch?** Or can producers start with B2C only and add B2B later?
2. **Subscription pricing** — Are the PRD ranges (80-1000 EUR/yr) confirmed?
3. **0% commission on Premium** — This means Dixis earns ONLY from the subscription fee. Is this sustainable?
4. **Business types** — What types? Restaurants, hotels, caterers, retail stores, food service?
5. **Wholesale pricing** — Separate price per product? Or automatic discount (e.g., -15% off retail)?
6. **Verification** — What documents do businesses need to provide? Just AFM/DOY or more?
7. **B2B invoicing** — Do we need proper Greek tax invoices (timologio) or just receipts?
8. **Minimum order values** — Do B2B orders have minimum amounts?

---

## 4. Other Missing Business Logic

### Invoice/Receipt Generation
- **Status:** Nothing exists
- **Need:** B2C order receipts (email is currently the "receipt"), B2B proper tax invoices
- **Effort:** M (2-3 PRs)

### Refund System
- **Status:** Order model has `refund_id`, `refunded_amount_cents`, `refunded_at` fields. No UI or automation.
- **Need:** Admin can initiate refund, Stripe refund API call, status updates, email notification
- **Effort:** M (2-3 PRs)

### PRD-07 Payments & Compliance
- **Status:** Document is **COMPLETELY EMPTY** (just template headers)
- **Need:** Define payment compliance requirements, PSD2, SCA, data retention, GDPR
- **Effort:** Documentation first, then implementation

---

## 5. Recommended Priority Order

### Phase 1: Revenue Foundation (can start NOW, while onboarding producers)

> These are essential for actually making money from the marketplace.

| # | Task | Effort | Why |
|---|------|--------|-----|
| 1 | COMM-01: Wire commission to checkout | S | Without this, we earn nothing |
| 2 | COMM-02: Activate feature flag | Config | Make it work in production |
| 3 | PAYOUT-01: IBAN field for producers | S | Need bank details to pay them |
| 4 | PAYOUT-02: Settlement generation command | M | Know how much to pay each producer |
| 5 | PAYOUT-03: Admin settlement dashboard | M | Admin can see and mark payouts |

**Total: ~5 PRs, ~2 weeks. After this, Dixis can track commissions and pay producers.**

### Phase 2: Visibility & Control (after first real orders)

| # | Task | Effort | Why |
|---|------|--------|-----|
| 6 | COMM-03: Admin commission rules CRUD | M | Change rates without code |
| 7 | COMM-04: Producer commission display | S | Transparency with producers |
| 8 | PAYOUT-04: Producer payout history | S | Producers see their earnings |
| 9 | PAYOUT-05: Settlement CSV/PDF export | S | Admin does bank transfers efficiently |
| 10 | COMM-05: Cost transparency UI (S3-01) | S | Consumer differentiator |

**Total: ~5 PRs, ~2 weeks.**

### Phase 3: B2B MVP (when business demand appears)

| # | Task | Effort | Why |
|---|------|--------|-----|
| 11 | B2B-Phase-1: Business role + registration | M | New user type |
| 12 | B2B-Phase-2: Subscription plans + billing | L | Revenue from subscriptions |
| 13 | B2B-Phase-3: Wholesale pricing | M | Different prices for businesses |

**Total: ~11 PRs, ~4-6 weeks.**

### Phase 4: B2B Full + Advanced (when B2B has traction)

| # | Task | Effort | Why |
|---|------|--------|-----|
| 14 | B2B-Phase-4: Bulk + recurring orders | L | B2B core needs |
| 15 | B2B-Phase-5: Invoicing + analytics | M | Business compliance |
| 16 | PAYOUT-06: Stripe Connect automation | XL | Scale payouts |

**Total: ~12 PRs, ~6-8 weeks.**

---

## Summary

```
TODAY:  Orders work, payments work, but Dixis earns 0 EUR per order.
        No commission tracking. No producer payouts. No B2B.

PHASE 1 (2 weeks): Commission active + settlement reports = Dixis earns money + can pay producers.
PHASE 2 (2 weeks): Admin control + producer transparency = Professional operation.
PHASE 3 (4-6 weeks): B2B MVP = New revenue stream from businesses.
PHASE 4 (6-8 weeks): B2B full + automated payouts = Scaled operations.
```

**The user can onboard producers NOW while Phase 1 is built. The first few orders can have commissions calculated retroactively if needed.**
