# Dixis — Monthly Operating Costs

**Last Updated:** 2026-03-06
**Purpose:** Full breakdown of recurring costs to run the platform
**Source:** Confirmed by Panagiotis (2026-03-06)

---

## Summary

| Category | Ατομική | ΙΚΕ | Notes |
|----------|---------|-----|-------|
| **Infrastructure** | €21.50 | €21.50 | VPS + DB + Domain |
| **AI / Dev Tools** | €190 | €190 | Claude + GPT + Gemini |
| **Business Tools** | €0-15 | €0-15 | Elorus (invoicing) + courier API |
| **Comms (SMS/OTP)** | ~€10 | ~€10 | Phone + SMS |
| **Λογιστής** | €150 | €400 | Ατομική vs ΙΚΕ |
| **Δικηγόρος** | ~€25 | ~€25 | Per case (~€100/case, ~3x/yr) |
| **Ασφάλεια** | — | ~€85-165 | Professional + general liability |
| **Payments** | Variable | Variable | Stripe ~2.9% + €0.25/txn |
| **TOTAL (fixed)** | **~€397-412** | **~€732-827** | |

---

## 1. Infrastructure

| Service | What | Cost | Billing | Status |
|---------|------|------|---------|--------|
| **Hostinger VPS** | KVM 2 (2 vCPU, 8GB RAM, 100GB NVMe) — hosts Next.js + Umami + nginx | **€20/mo** | Annual prepaid | ✅ Active |
| **Neon PostgreSQL** | Free tier — production DB | €0 (free tier) | — | ✅ Active |
| **Domain (dixis.gr)** | .gr domain registration | **€1.50/mo** (~€18/yr) | Annual | ✅ Active |
| **SSL Certificate** | Let's Encrypt via certbot | €0 | Auto-renew | ✅ Active |
| **GitHub** | Free tier — repo, CI/CD, issues | €0 | — | ✅ Active |

**Subtotal: €21.50/mo**

---

## 2. AI / Development Tools

| Service | What | Cost | Billing | Status |
|---------|------|------|---------|--------|
| **Claude (Anthropic)** | AI coding assistant — primary dev tool (Max/Team plan) | **€160/mo** | Monthly | ✅ Active |
| **ChatGPT (OpenAI)** | GPT-4 for research, mockups, brainstorming | **€22/mo** | Monthly | ✅ Active |
| **Gemini (Google)** | Google AI — research, alternative perspective | **€8/mo** | Monthly | ✅ Active |

> **Note:** Claude is by far the biggest AI expense at €160/mo. Worth reviewing usage — if dev velocity drops (e.g., after launch stabilizes), could downgrade to Pro (€20/mo) and save €140/mo.

**Subtotal: €190/mo**

---

## 3. Business Tools

| Service | What | Cost | Billing | Status |
|---------|------|------|---------|--------|
| **Elorus** | Invoicing / billing platform (Greek) | ❓ TBD | Monthly | ❓ Research needed |
| **Courier/Shipping API** | API for tracking shipments (ACS, ELTA, Speedex, etc.) | ❓ TBD | Per-use or monthly | ❓ Future need |
| **Resend** | Transactional email (order confirmations, OTP) | €0 (free: 3K emails/mo) | — | ✅ Active |
| **Umami Analytics** | Self-hosted on VPS — cookieless, GDPR | €0 (self-hosted) | — | ✅ Active |
| **Stripe** | Payment processing (cards) | 2.9% + €0.25/txn | Per transaction | ✅ Active |

> **Action items:**
> - Research Elorus pricing (free tier? paid plan?)
> - Research courier API costs (ACS has API, most Greek couriers do)
> - Panagiotis mentioned "και το αλλο για τα τιμολογια" — another invoicing tool? Clarify.

**Subtotal: ~€0-15/mo (TBD after research)**

---

## 4. Communications (Phone / SMS)

| Service | What | Cost | Status |
|---------|------|------|--------|
| **Phone + SMS** | Admin OTP, customer notifications | **~€10/mo** | ✅ Active (per Panagiotis) |

> **Note:** SMS provider not yet connected to platform (OTP works via logs/email). Provider options: Twilio, Telnyx, Yuboto. Decision pending.

**Subtotal: ~€10/mo**

---

## 5. Professional Services

| Service | What | Ατομική | ΙΚΕ | Billing | Status |
|---------|------|--------|-----|---------|--------|
| **Λογιστής** | Accounting, tax filings, VAT | **€150/mo** | **€400/mo** | Monthly | ✅ Active |
| **Δικηγόρος** | Legal — terms, contracts, compliance | **€100/case** | **€100/case** | Per case | ✅ Available |

> **IKE vs Ατομική — the big decision:**
>
> | | Ατομική | ΙΚΕ |
> |---|---|---|
> | Λογιστής | €150/mo | €400/mo |
> | Ευθύνη | Απεριόριστη προσωπική | Περιορισμένη (μόνο κεφάλαιο εταιρείας) |
> | Τιμολόγια τροφίμων | Πιο περίπλοκο | Πιο εύκολο/ασφαλές |
> | Αξιοπιστία B2B | Χαμηλότερη | Υψηλότερη |
> | Extra κόστος | — | €250/mo παραπάνω |
>
> **CTO recommendation:** ΙΚΕ. Τα τρόφιμα έχουν θέμα ευθύνης (υγειονομικό ρίσκο). Με ατομική, αν γίνει πρόβλημα, χάνεις τα πάντα προσωπικά. Με ΙΚΕ, χάνεις μόνο ό,τι έχει η εταιρεία. Τα €250/mo extra αξίζουν τη μείωση ρίσκου. Επίσης, B2B πελάτες (εστιατόρια, ξενοδοχεία) προτιμούν να συνεργάζονται με ΙΚΕ.
>
> **Δικηγόρος:** Per case (~€100/case). Εκτίμηση 2-4 φορές/χρόνο = ~€200-400/yr = ~€25/mo amortized.

**Subtotal (Ατομική): ~€175/mo**
**Subtotal (ΙΚΕ): ~€425/mo**

---

## 6. Payment Processing (Variable)

| Scenario | GMV/mo | Stripe fees (~3.15%) | Net cost |
|----------|--------|---------------------|----------|
| Early (20 orders, €40 AOV) | €800 | ~€25 | €25/mo |
| Growing (50 orders, €40 AOV) | €2,000 | ~€63 | €63/mo |
| Scaling (100 orders, €45 AOV) | €4,500 | ~€142 | €142/mo |

> Stripe fees come from revenue, not from pocket. COD orders have no Stripe fee but +€4 fee to customer.

---

## 7. NOT Currently Paying For (but may need later)

| Service | What | Est. Cost | When needed |
|---------|------|-----------|-------------|
| **Hotjar / PostHog** | Heatmaps, session recording | €0-39/mo | After 50+ daily visitors |
| **Resend Pro** | Email beyond 3K/mo | ~€20/mo | After ~100 orders/month |
| **Neon Pro** | DB beyond free tier (0.5GB) | ~€19/mo | After ~1000 products |
| **Sentry** | Error monitoring | €0 (free) → €26/mo | When team grows |
| **Marketing ads** | Google/Meta/Instagram | €50-200/mo | After first €500 commission |
| **Hetzner / bigger VPS** | If traffic exceeds current VPS | €20-40/mo | After 500+ daily visitors |

---

## Cost Scenarios

> All scenarios shown for both entity types. **Recommended: ΙΚΕ** (see Section 5).

### Scenario A: Now (pre-revenue, 0 orders)

| | Ατομική | ΙΚΕ |
|---|---|---|
| Infrastructure | €21.50 | €21.50 |
| AI tools | €190 | €190 |
| Business tools | €0 | €0 |
| Professional | €175 | €425 |
| SMS/Phone | €10 | €10 |
| **TOTAL** | **€396.50** | **€646.50** |

### Scenario B: Early traction (20-30 orders/mo)

| | Ατομική | ΙΚΕ |
|---|---|---|
| Infrastructure | €21.50 | €21.50 |
| AI tools | €190 | €190 |
| Business tools | €15 | €15 |
| Professional | €175 | €425 |
| SMS/Phone | €10 | €10 |
| Stripe fees | €25 | €25 |
| **TOTAL** | **€436.50** | **€686.50** |
| Commission (12% of €1,000) | +€120 | +€120 |
| **Net burn** | **€316.50** | **€566.50** |

### Scenario C: Growing (50-80 orders/mo)

| | Ατομική | ΙΚΕ |
|---|---|---|
| Infrastructure | €21.50 | €21.50 |
| AI tools | €190 | €190 |
| Business tools | €15 | €15 |
| Professional | €175 | €425 |
| SMS/Phone | €10 | €10 |
| Stripe fees | €63 | €63 |
| Marketing | €50-100 | €50-100 |
| **TOTAL** | **€524.50-574.50** | **€774.50-824.50** |
| Commission (12% of €2,500) | +€300 | +€300 |
| **Net burn** | **€224.50-274.50** | **€474.50-524.50** |

### Breakeven targets

| | Ατομική | ΙΚΕ |
|---|---|---|
| Monthly fixed costs | ~€400 | ~€650 |
| Breakeven GMV at 12% | **~€3,333/mo** | **~€5,417/mo** |
| Orders needed (€40 AOV) | **~83 orders** | **~135 orders** |
| Orders needed (€60 AOV) | **~56 orders** | **~90 orders** |

### Runway analysis (€5K capital)

| | Ατομική | ΙΚΕ |
|---|---|---|
| Monthly burn | ~€400 | ~€650 |
| Runway (0 revenue) | **~12.5 months** | **~7.5 months** |
| With €120/mo revenue | ~14.5 months | ~9 months |

> **Reality check (ΙΚΕ):** Runway ~7.5 μήνες. Revenue πρέπει να ξεκινήσει εντός 3-4 μηνών.
> **Reality check (Ατομική):** Runway ~12.5 μήνες. Πιο αναπνοή, αλλά μεγαλύτερο νομικό ρίσκο στα τρόφιμα.

---

## Biggest Cost Drivers (ranked, ΙΚΕ scenario)

1. **Λογιστής (ΙΚΕ)** — €400/mo — 62% of total
2. **Claude AI** — €160/mo — 25% of total
3. **GPT + Gemini** — €30/mo — 5% of total
4. **Everything else** — €56.50/mo — 8% of total

> **CTO observation:** Ο λογιστής + Claude = €560/mo, δηλαδή 86% του burn. Αν χρειαστεί cut:
> - **Μεγαλύτερο save:** Ατομική αντί ΙΚΕ → -€250/mo (αλλά μεγαλύτερο ρίσκο)
> - **Δεύτερο save:** Claude Pro αντί Max → -€140/mo
> - **Μαζί:** -€390/mo → burn πέφτει στα ~€260/mo → runway 19 μήνες

---

## Decision Log

| Date | Decision | Details |
|------|----------|---------|
| 2026-03-06 | Δικηγόρος = per case | ~€100/case, ~2-4x/year |
| 2026-03-06 | Λογιστής: €150 ατομική, €400 ΙΚΕ | Confirmed by accountant |
| 2026-03-07 | **ΙΚΕ confirmed** | Decision made — going with IKE for liability protection |
| 2026-03-07 | Insurance needed | Professional liability ~€85-165/mo, budget from quotes |

---

## Action Items

- [x] ~~Clarify lawyer frequency~~ → Per case (~€100/case)
- [x] ~~Confirm accountant cost~~ → €150 ατομική, €400 ΙΚΕ
- [x] ~~Ατομική ή ΙΚΕ~~ → **ΙΚΕ confirmed** (2026-03-07)
- [ ] **NEW**: Get insurance quotes (professional liability + general liability, ~€85-165/mo)
- [ ] **Research**: Elorus pricing + features needed
- [ ] **Research**: Courier API costs (ACS, Speedex, ELTA Courier)
- [ ] **Panagiotis**: "Και το αλλο για τα τιμολογια" — which invoicing tool besides Elorus?
- [ ] **Panagiotis**: List any other costs you remember
- [ ] **Decide**: SMS/OTP provider (Twilio vs Telnyx vs Yuboto)
- [ ] **Consider**: Downgrading Claude Max → Pro if dev velocity stabilizes (saves €140/mo)
- [ ] Review this doc monthly — update after first real orders

---

_**ΙΚΕ path:** €5K capital / €650 burn = ~7.5 months runway. Need revenue within 3-4 months._
_**Ατομική path:** €5K capital / €400 burn = ~12.5 months runway. More time, more personal risk._
_**Emergency mode:** Ατομική + Claude Pro = ~€260/mo = 19 months runway._
