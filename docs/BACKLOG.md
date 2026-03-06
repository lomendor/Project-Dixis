# Dixis — Master Backlog & Roadmap

**Last Updated:** 2026-03-06
**Source PRD:** `PRD Dixis Teliko (2).md` (owner's original vision document)
**Current State:** Functional MVP+ in production

---

## How to Read This Document

- **Stages** go in order (1 → 2 → 3 → 4 → 5). Complete one before starting the next.
- Each stage has **tickets** with IDs (e.g. `S1-01`). Work items within a stage can be done in any order unless noted.
- **Effort** = S (1 PR, ~50 LOC), M (2-3 PRs, ~150 LOC), L (4-6 PRs, ~300+ LOC), XL (7+ PRs)
- **Status**: `[ ]` = not started, `[~]` = in progress, `[x]` = done, `[-]` = cut/deferred
- This is a living document. Update it as work progresses.

---

## What We Have Today (MVP+ Baseline)

Before planning what to build, here's what **already works in production**:

| Area | Details | Status |
|------|---------|--------|
| Auth | Consumer/Producer/Admin roles, email verification, password reset | ✅ |
| Products | Catalog, search, category filters, `is_organic` flag, `is_seasonal` flag | ✅ |
| Producer Profiles | Onboarding, verification, approval/rejection, settings | ✅ |
| Cart & Checkout | Multi-producer cart, shipping per producer, guest checkout | ✅ |
| Payments | COD (Antikatavoli) + Stripe card | ✅ |
| Shipping | 4 zones, dynamic rates, ACS Courier, BoxNow lockers, free shipping thresholds | ✅ |
| Commissions | 7% B2C, configurable rules, fee breakdown | ✅ |
| Orders | Create, track (public token), status updates, refunds | ✅ |
| Email Notifications | 10 mail templates: consumer, producer, admin notifications | ✅ |
| Producer Dashboard | Sales analytics, KPIs, top products, order management | ✅ |
| Admin Dashboard | Orders, producers, products, analytics, moderation | ✅ |
| Product Moderation | Approve/reject workflow with reasons | ✅ |
| In-App Notifications | Bell icon, unread count, mark-as-read | ✅ |
| Tax Calculation | VAT per order | ✅ |
| Tracking | Public order tracking by token, shipment tracking | ✅ |

**Database fields that exist but are not fully used in the UI:**
- `is_organic` (boolean) — exists in DB and API, partially shown
- `is_seasonal` (boolean) — exists in DB and API, no calendar UI
- `discount_price` — exists, no promo UI
- `is_featured` — exists, no featured section on homepage

---

## Stage 0 — Legal & Business Foundation

> **Goal:** Protect the business legally before onboarding real producers or processing real orders.
> **Timeline:** ASAP — before any real producer goes live
> **Theme:** "We are legally protected and compliant."
> **Reference:** `docs/LEGAL-LIABILITY-FOOD-MARKETPLACE.md` (full legal research)

### S0-01: IKE Formation
**Why:** Limited liability protection for food marketplace. Personal assets at risk without it.
**What:**
- Form ΙΚΕ (Private Limited Company) with accountant
- Register with tax authority, GEMI
- Update all platform legal references to company entity
**Effort:** External (accountant + lawyer)
**Status:** `[ ]` — **DECIDED: Going with IKE** (2026-03-07)

### S0-02: Producer Agreement (Contract)
**Why:** Legal protection — indemnification clause, FBO declaration, document requirements.
**What:**
- Draft producer agreement with lawyer (~€100-200)
- Include: indemnification clause, HACCP requirement, EFET registration, accurate labeling obligation
- Include: recall cooperation, termination for food safety violations
- All producers must sign before listing
**Effort:** External (lawyer)
**Status:** `[ ]`

### S0-03: Terms of Service Update
**Why:** Clear intermediary status protects Dixis from product liability claims.
**What:**
- Update ToS with clear "marketplace intermediary" declaration
- Add allergen warnings, complaint handling procedure
- Add right-of-withdrawal exclusions for perishable food
- Lawyer review (~€100-200)
**Effort:** S (1 PR for website implementation after lawyer drafts)
**Status:** `[ ]`

### S0-04: EFET Clarification
**Why:** Must know if Dixis needs to register with EFET as food marketplace intermediary.
**What:**
- Contact EFET (info@efet.gr / 213 2145800)
- Ask: does a marketplace that never handles food need to register?
- Get answer in writing (email)
**Effort:** External (phone call + email)
**Status:** `[ ]`

### S0-05: Producer Onboarding Checklist
**Why:** DSA KYBC compliance + food safety verification before listing any producer.
**What:**
- Collect: EFET registration, HACCP docs, AFM, identity, business license
- Collect: signed Producer Agreement + self-certification
- Review: sample product labels for Reg 1169/2011 compliance
- Verify: information against VIES/GEMI databases
**Effort:** S (1 PR — admin checklist UI + document storage)
**Status:** `[ ]`

### S0-06: Product Page Legal Compliance
**Why:** Every product listing must identify the producer (EU PLD 2024/2853 + Greek Law 2251/1994).
**What:**
- Add producer legal name + location on every product page
- Add "Παράγεται και πωλείται από [Παραγωγό]. Η Dixis διαμεσολαβεί." disclaimer
- Add allergen warning for consumers with food allergies
- Add intermediary disclaimer on checkout page
**Effort:** S (1 PR — UI additions)
**Status:** `[ ]`

### S0-07: Professional Liability Insurance
**Why:** Even as intermediary, legal defense costs from a single food claim can be devastating.
**What:**
- Get quotes from 2-3 Greek insurance brokers
- Professional liability + general liability
- Budget: €1,000-2,000/year (~€85-165/month)
- Minimum coverage: €100,000 per claim
**Effort:** External (insurance broker)
**Status:** `[ ]`

### S0-08: Enable Stripe Connect for PSD2 Compliance ⚠️
**Why:** Processing payments without Stripe Connect could be classified as unlicensed payment services under PSD2 — serious regulatory risk.
**What:**
- Enable `STRIPE_CONNECT_ENABLED=true` in production `.env`
- Ensure all producers complete Stripe Express onboarding before going live
- Verify transfer webhook fires correctly after payment
- Document payment flow for lawyer review
**Code Status:** ✅ Already built (StripeConnectService.php, migrations, controllers). Just needs activation + testing.
**Effort:** S (1 PR — env config + integration test)
**Status:** `[ ]` — **Must be done before first real producer goes live**
**Reference:** `docs/LEGAL-LIABILITY-FOOD-MARKETPLACE.md` Section 10

---

## Stage 1 — Trust & Core Commerce

> **Goal:** Make customers confident enough to buy. Add the features that any serious marketplace must have.
> **Timeline:** 2-4 weeks
> **Theme:** "I trust this platform enough to spend my money here."

### S1-01: Cultivation Type / Production Method
**Why:** The PRD emphasizes this as core to Dixis identity. Consumers want to know HOW their food was produced.
**What:**
- Add `cultivation_type` enum field to products: `conventional`, `organic_certified`, `organic_transitional`, `biodynamic`, `traditional_natural`, `other`
- Add `cultivation_description` text field (free text explanation)
- Backend: migration + model + API + validation
- Frontend: badge/icon on product card, filter on catalog, field in producer product form
**Effort:** M (1 PR: full-stack, 230 LOC)
**Status:** `[x]` — PR #2908, deployed 2026-02-15

### S1-02: Reviews & Ratings
**Why:** Trust signal #1 for any marketplace. Without reviews, buyers hesitate. PRD says Phase 1.
**What:**
- Review model: user_id, product_id, order_id, rating (1-5), title, comment, is_verified, is_approved
- Only users who completed an order can review (verified purchase)
- Average rating displayed on product cards
- Review list on product detail page
- Producer sees reviews in dashboard
- Admin moderation (approve/reject)
**Effort:** L (2 PRs: backend model+migration+API, frontend stars+review section+form)
**Status:** `[x]` — PRs #2911 (backend), #2912 (frontend), deployed 2026-02-15
**Note:** Producer dashboard reviews + admin moderation deferred to S1-02b when needed.

### S1-03: Q&A on Product Pages
**Why:** Reduces purchase anxiety. Publicly visible answers help ALL visitors. PRD says Phase 1.
**What:**
- ProductQuestion model: user_id, product_id, question, created_at
- ProductAnswer model: question_id, user_id (producer), answer, created_at
- Public Q&A section below product description
- Producer notification when new question arrives
- Producer answers from dashboard
**Effort:** M (3 PRs: models+API, product page UI, producer notification)
**Status:** `[ ]`

### S1-04: Wishlist / Favorites ✅
**Why:** Creates return visits. Consumers save products they'll buy later. Quick path to re-purchase.
**What:**
- ~~Wishlist model: user_id, product_id~~ → Client-only (localStorage) for now
- Heart icon on product cards (toggle) ✅
- Heart icon on product detail page ✅
- "My Favorites" page in account area ✅
- Nav links in header dropdown + mobile menu ✅
- "Add all to cart" button — deferred until real usage
- Server sync — deferred until real users
**Effort:** S (1 PR: frontend-only, ~250 LOC)
**Status:** `[x]` ✅ Done — PR on claude/cranky-dubinsky. Zustand store + FavoriteButton + /account/favorites page.

### S1-05: Product Certifications Display
**Why:** Builds trust. Shows quality credentials prominently.
**What:**
- Producer can upload certification PDFs (already have file upload)
- Badge system: "Certified Organic", "PDO/PGI", "Bio" etc.
- Visible on product card and detail page
**Effort:** S (1-2 PRs)
**Status:** `[ ]`

---

## Stage 2 — UI/UX Polish

> **Goal:** Make the platform beautiful and professional. First impressions matter.
> **Timeline:** 2-3 weeks (after Stage 1 features exist to polish)
> **Theme:** "This looks like a platform I want to use."

### S2-01: Homepage Redesign
**Why:** First thing visitors see. Must communicate trust, quality, Greek identity.
**What:**
- Hero section with featured producers/products
- "Why Dixis" value proposition section
- Featured products carousel (use `is_featured` flag)
- Seasonal highlights
- Producer stories section
- Trust badges (secure payments, Greek producers, direct from farm)
**Effort:** M (2-3 PRs)
**Status:** `[ ]`

### S2-02: Product Card & Detail Page Polish
**Why:** Where buying decisions happen. Must show reviews, badges, cultivation type beautifully.
**What:**
- Product card: rating stars, cultivation badge, seasonal indicator, wishlist heart
- Detail page: image gallery, clear price/add-to-cart area, reviews section, Q&A section, cost transparency
- Mobile optimization
**Effort:** M (2-3 PRs)
**Status:** `[ ]`

### S2-03: Producer Profile Page Polish
**Why:** Storytelling is Dixis's identity. Producer pages must be compelling.
**Current state (2026-03-06):** Split hero layout deployed (large image left, info right, meta pills, quote-style description). But the page still feels thin because the API only returns: name, region, description, image_url (single), products. No gallery, story, coordinates, certifications, or social links.

**Phase A — Backend data enrichment (Laravel):**
- [ ] `S2-03a` **Gallery**: Add `producer_images` table (multi-photo upload, 5-8 images). Return in API.
- [ ] `S2-03b` **Story/Bio**: Add `story` text field to producers (longer narrative, separate from short `description`). Return in API.
- [ ] `S2-03c` **Coordinates**: Ensure `latitude`/`longitude` are populated for producers. Map already renders when data exists.
- [ ] `S2-03d` **Certifications**: Add `producer_certifications` relation (reuse S1-05 badge system). Return in API.
- [ ] `S2-03e` **Social links**: Add `instagram`, `facebook`, `youtube` fields to producers. Return in API.
- [ ] `S2-03f` **Category**: Ensure producer `category` field is populated (currently empty string in API).

**Phase B — Frontend presentation (after data exists):**
- [ ] `S2-03g` **Photo gallery**: Swipeable image carousel in hero area (use gallery data from S2-03a)
- [ ] `S2-03h` **"Η Ιστορία μας" section**: Rich story display below hero (use story from S2-03b)
- [ ] `S2-03i` **Certification badges**: Visible on profile + product cards (use S2-03d)
- [ ] `S2-03j` **Social links row**: Instagram/Facebook/YouTube icons in meta area (use S2-03e)
- [ ] `S2-03k` **Map polish**: Larger map, better pin, maybe satellite view toggle (coordinates from S2-03c)
- [ ] `S2-03l` **"Επικοινωνία" section**: Contact/message form or link to producer

**Quick wins (frontend-only, no backend needed):**
- [x] Split hero layout with large image (done 2026-03-06)
- [x] Meta pills: region + product count (done 2026-03-06)
- [x] Quote-style description with border accent (done 2026-03-06)
- [x] `S2-03m` Truncate long descriptions (3 lines + "Περισσότερα...") — done 2026-03-06
- [x] `S2-03n` CTA button "Δείτε τα προϊόντα ↓" with smooth scroll — done 2026-03-06
- [x] `S2-03o` Better product grid section header + transition from hero — done 2026-03-06

**Effort:** L (Phase A: 3-4 Laravel PRs, Phase B: 3-4 frontend PRs, Quick wins: 1 PR)
**Status:** `[~]` In progress — hero layout done, data enrichment pending

### S2-04: Checkout Flow Polish
**Why:** Reduce cart abandonment. Clear, fast, confidence-building checkout.
**What:**
- Progress indicators (step 1/2/3)
- Better address form with autofill hints
- Clearer shipping options display
- Order summary with product thumbnails
- Trust badges at payment step
**Effort:** M (2 PRs)
**Status:** `[ ]`

### S2-05: Mobile Experience Audit
**Why:** PRD requires mobile-first. Many users will browse on phones.
**What:**
- Review all pages on mobile viewport
- Fix touch targets, font sizes, spacing
- Optimize navigation for thumb zones
- Test checkout flow on mobile
**Effort:** M (2-3 PRs)
**Status:** `[ ]`

### S2-06: Loading States & Micro-interactions
**Why:** Professional feel. Skeleton loaders instead of spinners, smooth transitions.
**What:**
- Skeleton loaders for product grid, cart, orders
- Smooth page transitions
- Button feedback (loading states on submit)
- Toast notification improvements
**Effort:** S (1-2 PRs)
**Status:** `[ ]`

---

## Stage 3 — Growth & Engagement

> **Goal:** Bring customers back. Increase sales per customer. Drive organic traffic.
> **Timeline:** 3-4 weeks
> **Theme:** "I keep coming back because there's always something new."

### S3-01: Cost Transparency
**Why:** CORE DIFFERENTIATOR from PRD. Shows exactly where the money goes. Data ALREADY EXISTS in commission system.
**What:**
- Small visual breakdown on product page: "Ο παραγωγός λαμβάνει X%, πλατφόρμα Y%, μεταφορικά Z%"
- Simple bar chart or pie icon
- Comparison with traditional supply chain (optional)
**Effort:** S (1 PR — data exists, just needs UI)
**Status:** `[x]` ✅ Done (PR #2960, deployed 2026-02-16) — Green trust badge on product pages showing ">80% στον παραγωγό". Bidirectional PriceBreakdown component in producer + admin forms (PRs #3264-#3266, deployed 2026-03-02).

### S3-02: Seasonal Calendar & Products
**Why:** Greek agriculture is seasonal. This creates urgency and regular return visits.
**What:**
- Seasonal calendar page (interactive, by month)
- Filter products by current season
- "Coming Soon" for upcoming seasonal items
- Notification signup for seasonal availability
- Use existing `is_seasonal`, `season_start`, `season_end` fields
**Effort:** M (2-3 PRs)
**Status:** `[ ]`

### S3-03: Cart Abandonment Emails
**Why:** Recovers 10-15% of lost sales. Standard e-commerce practice.
**What:**
- Track when user adds to cart but doesn't complete checkout
- Send reminder email after 1 hour
- Send second reminder after 24 hours with gentle incentive
- Unsubscribe option
**Effort:** M (2 PRs: tracking + scheduler, email template)
**Status:** `[ ]`

### S3-04: SEO Foundation
**Why:** Organic traffic is free. Greek food searches should land on Dixis.
**What:**
- Product schema markup (JSON-LD: Product, Review, Offer)
- Dynamic sitemap.xml generation
- Meta title/description templates per page type
- Open Graph / Twitter Card tags
- Producer page structured data
- Organization JSON-LD with sameAs (LinkedIn, Instagram)
**Effort:** M (2 PRs)
**Status:** `[x]` ✅ Done — Majority already built across multiple sessions. PR #3272 (2026-03-04): shortened meta title, enriched Organization JSON-LD (sameAs, contactPoint, foundingDate), added metadata to Contact/FAQ pages. Previously: sitemap.ts, robots.ts, OG images, Product/BreadcrumbList/ItemList schemas, per-page metadata all implemented.

### S3-05: Enhanced Search & Discovery
**Why:** Users must find what they want quickly. Better search = more sales.
**What:**
- Search by cultivation type (organic, traditional, etc.)
- Search by region/location
- Auto-suggestions as you type
- "Similar Products" section on product detail
- "Other products by this producer" section
**Effort:** M (2-3 PRs)
**Status:** `[ ]`

### S3-06: Email Marketing Foundation
**Why:** Cheapest customer retention channel. Builds relationship.
**What:**
- Welcome email series (after registration)
- Monthly newsletter with seasonal highlights
- "Back in stock" notifications for wishlisted items
- New product alerts from favorite producers
**Effort:** M (2-3 PRs)
**Status:** `[ ]`

---

## Stage 4 — Differentiators

> **Goal:** Make Dixis unique. Features that no competitor has.
> **Timeline:** 4-6 weeks
> **Theme:** "I can't get this experience anywhere else."

### S4-01: Virtual Tours (Basic)
**Why:** Emotional connection between consumer and producer. See the farm, the process.
**What:**
- Producer embeds YouTube/Vimeo video on their profile
- Photo gallery of production process → **Note: gallery infra built in S2-03a/S2-03g**
- "Farm Story" rich text section → **Note: story field built in S2-03b/S2-03h**
- Video thumbnails on product pages linking to producer tour
**Effort:** S-M (2 PRs for basic version — reduced if S2-03 gallery/story already exist)
**Status:** `[ ]`

### S4-02: Adopt a Tree / "Noikazo Dentro"
**Why:** YOUR SIGNATURE FEATURE. Emotional bond, recurring revenue, incredible marketing potential. PRD calls it "Yiothesia" (Adoption).
**What:**
- **Adoption Items**: Producer lists items (tree, beehive, plot, animal) with photos, description, price, duration
- **Adoption Flow**: Consumer selects item → pays (monthly or annual) → "adopts" it
- **Updates**: Producer posts regular photo/video updates about the adopted item
- **Products**: Consumer receives products from their adopted item (olive oil from their tree, honey from their hive)
- **Gift Option**: Adopt as a gift for someone
- **Dashboard**: Consumer sees their adoptions with latest updates
- **Producer Dashboard**: Manage adoption items, post updates, track subscribers
**Effort:** XL (6-8 PRs — new domain with its own models, payments, UI)
**Status:** `[ ]`

### S4-03: Pre-Order Campaigns
**Why:** Guarantees income for producers. Creates engagement. Crowdfunding for agriculture.
**What:**
- Producer creates campaign: products, quantities, discount %, deadline, minimum orders
- Progress bar: "15 of 30 orders placed"
- Consumer pre-orders at discounted price
- Campaign fulfilled when minimum reached, or cancelled/refunded
- Notification when campaign reaches goal
**Effort:** L (4-5 PRs)
**Status:** `[ ]`

### S4-04: Limited Edition & Urgency
**Why:** Creates FOMO. Drives impulse purchases.
**What:**
- "Limited Edition" badge with remaining quantity
- Countdown timer for availability window
- "Almost sold out" indicator
- Priority access for returning customers
**Effort:** S (1-2 PRs — uses existing `is_limited_edition`, `limited_quantity` fields if we add them)
**Status:** `[ ]`

---

## Stage 5 — B2B & Revenue Expansion

> **Goal:** New revenue streams. Subscription income from businesses.
> **Timeline:** 4-8 weeks
> **Theme:** "Dixis is not just B2C — it's the wholesale platform for Greek food."

### S5-01: B2B Registration
**Why:** Restaurants, hotels, caterers want direct access to producers. Recurring revenue.
**What:**
- Business registration form: company name, VAT (AFM), tax office (DOY), business type
- Admin verification of business documents
- Business profile with delivery points
**Effort:** M (2-3 PRs)
**Status:** `[ ]`

### S5-02: Subscription Plans
**Why:** Recurring revenue: Basic (€80-120/yr), Pro (€200-300/yr), Premium (€500-1000/yr).
**What:**
- 3 subscription tiers with different commission rates
- Stripe subscription billing (monthly/annual)
- Subscription management page
- Auto-renewal and cancellation flow
**Effort:** L (4-5 PRs)
**Status:** `[ ]`

### S5-03: Bulk Orders & Recurring Orders
**Why:** B2B customers order in volume and on schedule.
**What:**
- CSV import for bulk ordering (SKU + quantity)
- Recurring order templates (weekly, monthly)
- Multiple delivery addresses per business
- Volume pricing / quantity discounts
**Effort:** L (4-5 PRs)
**Status:** `[ ]`

### S5-04: B2B Analytics & Reporting
**Why:** Businesses need reports for their accounting.
**What:**
- Purchase history reports (by period, by producer)
- Invoice generation (proper Greek invoices with AFM)
- Spending analytics
- Export to CSV/PDF
**Effort:** M (2-3 PRs)
**Status:** `[ ]`

---

## Stage 6 — Community & Sustainability (Vision)

> **Goal:** Build a living community around Greek food. Long-term engagement.
> **Timeline:** Ongoing, after core platform is solid
> **Theme:** "Dixis is more than a store — it's a movement."

### S6-01: Community Forum
- Discussion threads by category (recipes, organic farming, seasonal cooking)
- Producer and consumer participation
- Moderation tools

### S6-02: Recipe Library
- User-submitted recipes using Dixis products
- Recipe links to products (buy ingredients)
- Featured recipes

### S6-03: Courses & Education
- Online courses (cooking, farming, sustainability)
- Video lessons with producer instructors
- Certificates of completion

### S6-04: Carbon Footprint & Sustainability
- Carbon tracking per product/order
- Packaging return program with reward points
- "Zero waste" product category
- Environmental impact reports

### S6-05: Producer Services Marketplace
- Branding & design services
- Product photography
- Marketing consulting
- Ordering and delivery of services

### S6-06: Affiliate / Referral Program
- Unique referral links
- Commission on referred purchases
- Dashboard for affiliates

### S6-07: Loyalty / Reward Points
- Points per purchase
- Redeem for discounts
- Tier system (Bronze, Silver, Gold)

### S6-08: Blog / Content Marketing
- SEO-optimized articles
- Producer stories
- Seasonal guides
- Recipe collections

---

## Quick Reference: Priority Matrix

| # | Feature | Impact | Effort | Stage |
|---|---------|--------|--------|-------|
| S1-01 | Cultivation Type | High | M | 1 |
| S1-02 | Reviews & Ratings | Critical | L | 1 |
| S1-03 | Q&A on Products | High | M | 1 |
| S1-04 | Wishlist | Medium | S | 1 |
| S1-05 | Certifications Display | Medium | S | 1 |
| S2-01 | Homepage Redesign | High | M | 2 |
| S2-02 | Product Card Polish | High | M | 2 |
| S2-03 | Producer Profile Polish | High | L | 2 | [~] Hero done, data pending |
| S2-04 | Checkout Polish | High | M | 2 |
| S2-05 | Mobile Audit | High | M | 2 |
| S2-06 | Loading States | Medium | S | 2 |
| S3-01 | Cost Transparency | Critical | S | 3 | ✅ Done |
| S3-02 | Seasonal Calendar | High | M | 3 |
| S3-03 | Cart Abandonment Emails | High | M | 3 |
| S3-04 | SEO Foundation | High | M | 3 | ✅ Done |
| S3-05 | Enhanced Search | Medium | M | 3 |
| S3-06 | Email Marketing | Medium | M | 3 |
| S4-01 | Virtual Tours | Medium | S-M | 4 |
| S4-02 | Adopt a Tree | Critical* | XL | 4 |
| S4-03 | Pre-Order Campaigns | High | L | 4 |
| S4-04 | Limited Edition | Medium | S | 4 |
| S5-01 | B2B Registration | High | M | 5 |
| S5-02 | Subscription Plans | High | L | 5 |
| S5-03 | Bulk Orders | Medium | L | 5 |
| S5-04 | B2B Analytics | Medium | M | 5 |

*S4-02 is marked Critical because it's the most unique feature of Dixis and a core emotional differentiator.

---

## Notes

- **No i18n work planned** — Greek-only for now, as agreed.
- **Stages 1-4** are the core product. After these, Dixis is a fully differentiated marketplace.
- **Stage 5** (B2B) can start in parallel with Stage 4 if business demand exists.
- **Stage 6** is long-term vision. Individual items can be pulled earlier if needed.
- Each PR stays within **≤300 LOC** guardrail.
- This document is the **single source of truth** for what we're building and in what order.
