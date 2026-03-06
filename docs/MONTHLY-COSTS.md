# Dixis — Monthly Operating Costs

**Last Updated:** 2026-03-06
**Purpose:** Full breakdown of recurring costs to run the platform
**Source:** Confirmed by Panagiotis (2026-03-06)

---

## Summary

| Category | Monthly | Annual | Notes |
|----------|---------|--------|-------|
| **Infrastructure** | €21.5 | €258 | VPS + DB + Domain |
| **AI / Dev Tools** | €190 | €2,280 | Claude + GPT + Gemini |
| **Business Tools** | €0-15 | €0-180 | Elorus (invoicing) + courier API |
| **Comms (SMS/OTP)** | ~€10 | ~€120 | Phone + SMS |
| **Professional** | €450-500 | €5,400-6,000 | Accountant (IKE) + Lawyer |
| **Payments** | Variable | Variable | Stripe ~2.9% + €0.25/txn |
| **TOTAL (fixed)** | **~€672-737** | **~€8,058-8,838** | |

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

| Service | What | Cost | Billing | Status |
|---------|------|------|---------|--------|
| **Λογιστής** | Monthly accounting, tax filings, VAT — **IKE setup** | **€350-400/mo** | Monthly | ✅ Active |
| **Δικηγόρος** | Legal — terms, contracts, compliance | **€100/mo** | ❓ Frequency unclear | ✅ Active |

> **Important:** Accountant cost is €350-400/mo **IF we form an IKE** (company). This is the biggest single monthly expense.
>
> **Lawyer:** Panagiotis pays €100 but isn't sure if this is monthly or per-case. Need to clarify.

**Subtotal: €450-500/mo**

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

### Scenario A: Now (pre-revenue, 0 orders)

| | Monthly |
|---|---|
| Infrastructure | €21.50 |
| AI tools | €190 |
| Business tools | €0 |
| Professional | €450-500 |
| SMS/Phone | €10 |
| **TOTAL** | **€671.50-721.50** |

### Scenario B: Early traction (20-30 orders/mo)

| | Monthly |
|---|---|
| Infrastructure | €21.50 |
| AI tools | €190 |
| Business tools | €15 (Elorus) |
| Professional | €450-500 |
| SMS/Phone | €10 |
| Stripe fees | €25 |
| **TOTAL** | **€711.50-761.50** |
| Commission revenue (12% of €1,000) | +€120 |
| **Net burn** | **€591.50-641.50** |

### Scenario C: Growing (50-80 orders/mo)

| | Monthly |
|---|---|
| Infrastructure | €21.50 |
| AI tools | €190 |
| Business tools | €15 |
| Professional | €450-500 |
| SMS/Phone | €10 |
| Stripe fees | €63 |
| Marketing | €50-100 |
| **TOTAL** | **€799.50-899.50** |
| Commission revenue (12% of €2,500) | +€300 |
| **Net burn** | **€499.50-599.50** |

### Scenario D: Breakeven target

| | Needed |
|---|---|
| Monthly fixed costs | ~€700 |
| Breakeven GMV at 12% commission | **~€5,833/mo** |
| That's roughly | **~145 orders x €40 AOV** |
| Or | **~97 orders x €60 AOV** |

> **Reality check:** With €5K capital and ~€700/mo burn, runway is **~7 months** (not 25 as previously estimated). This is tight. Revenue needs to start within 3-4 months.

---

## Biggest Cost Drivers (ranked)

1. **Λογιστής (IKE)** — €350-400/mo — 52% of total
2. **Claude AI** — €160/mo — 23% of total
3. **Δικηγόρος** — €100/mo — 14% of total
4. **Everything else** — €61.50/mo — 9% of total

> **CTO observation:** Accountant + lawyer = €550/mo, which is 77% of the total burn. These are non-negotiable for a legal business. The only flexible costs are AI tools (€190/mo). If things get tight, downgrading Claude to Pro saves €140/mo immediately.

---

## Action Items

- [ ] **Panagiotis**: Clarify lawyer frequency (€100/mo fixed or per-case?)
- [ ] **Panagiotis**: Confirm accountant cost — is €350-400 only if IKE? What if ατομική?
- [ ] **Research**: Elorus pricing + features needed
- [ ] **Research**: Courier API costs (ACS, Speedex, ELTA Courier)
- [ ] **Panagiotis**: "Και το αλλο για τα τιμολογια" — which other invoicing tool?
- [ ] **Panagiotis**: List any other costs you remember (you said "ξεχναω πολλα")
- [ ] **Decide**: SMS/OTP provider (Twilio vs Telnyx vs Yuboto)
- [ ] **Consider**: Downgrading Claude if dev velocity stabilizes (saves €140/mo)
- [ ] Review this doc monthly — update after first real orders

---

_Runway with €5K capital and ~€700/mo burn: **~7 months**_
_Breakeven needs ~€5,800/mo GMV at 12% commission_
_Critical: Must onboard producers + start revenue within 3-4 months_
