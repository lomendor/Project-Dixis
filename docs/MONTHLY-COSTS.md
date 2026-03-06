# Dixis — Monthly Operating Costs

**Last Updated:** 2026-03-06
**Purpose:** Full breakdown of recurring costs to run the platform

---

## Summary

| Category | Monthly | Annual | Notes |
|----------|---------|--------|-------|
| **Infrastructure** | ~€13 | ~€156 | VPS + DB + Domain |
| **SaaS / Tools** | ~€9 | ~€108 | Email + Analytics |
| **AI / Dev Tools** | ~€40 | ~€480 | Claude + GPT + Gemini |
| **Comms (SMS/OTP)** | ~€5-15 | ~€60-180 | Depends on volume |
| **Professional** | ~€150 | ~€1,800 | Accountant + lawyer |
| **Payments** | Variable | Variable | Stripe ~2.9% + €0.25/txn |
| **TOTAL (fixed)** | **~€217-227** | **~€2,604-2,724** | |

---

## 1. Infrastructure

| Service | What | Cost | Billing | Status |
|---------|------|------|---------|--------|
| **Hostinger VPS** | KVM 2 (2 vCPU, 8GB RAM, 100GB NVMe) — hosts Next.js + Umami + nginx | ~€8-10/mo | Annual prepaid | ✅ Active |
| **Neon PostgreSQL** | Free tier → Pro if needed — production DB | €0 (free tier) | — | ✅ Active |
| **Domain (dixis.gr)** | .gr domain registration | ~€15-20/yr (~€1.5/mo) | Annual | ✅ Active |
| **SSL Certificate** | Let's Encrypt via certbot | €0 | Auto-renew | ✅ Active |
| **GitHub** | Free tier — repo, CI/CD, issues | €0 | — | ✅ Active |

**Subtotal: ~€13/mo**

---

## 2. SaaS / Tools

| Service | What | Cost | Billing | Status |
|---------|------|------|---------|--------|
| **Resend** | Transactional email (order confirmations, OTP, etc.) | €0 (free tier: 3,000 emails/mo) | — | ✅ Active |
| **Umami Analytics** | Self-hosted on VPS — cookieless, GDPR compliant | €0 (self-hosted) | — | ✅ Active |
| **Stripe** | Payment processing (cards) | 2.9% + €0.25 per transaction | Per transaction | ✅ Active |

> **Note:** Plausible was considered but we went with self-hosted Umami (free). If email volume exceeds 3K/month, Resend Pro is ~$20/mo.

**Subtotal: ~€0/mo (until scale)**

---

## 3. AI / Development Tools

| Service | What | Cost | Billing | Status |
|---------|------|------|---------|--------|
| **Claude (Anthropic)** | AI coding assistant — primary dev tool | ~€20/mo (Pro plan) | Monthly | ✅ Active |
| **ChatGPT (OpenAI)** | GPT-4 for research, mockups, brainstorming | ~€20/mo (Plus plan) | Monthly | ✅ Active |
| **Gemini (Google)** | Google AI — research, alternative perspective | ~€0-20/mo | Monthly | ❓ Verify with Panagiotis |

> **Question for Panagiotis:** Ποια ακριβώς συνδρομή Gemini έχεις; Google One AI Premium (~€22/mo) ή κάτι άλλο;

**Subtotal: ~€40-60/mo**

---

## 4. Communications (SMS / Phone OTP)

**Current state:** Admin login uses phone OTP (6 digits). Built in Laravel, but **no SMS provider connected yet** — OTP works only via logs/email for now.

**Options researched:**

| Provider | Cost per SMS (GR) | Monthly minimum | Notes |
|----------|-------------------|-----------------|-------|
| **Twilio** | ~€0.04-0.07/SMS | Pay-as-you-go | Most popular, reliable, expensive |
| **Telnyx** | ~€0.02-0.04/SMS | Pay-as-you-go | Cheaper, good EU coverage |
| **Vonage (Nexmo)** | ~€0.03-0.06/SMS | Pay-as-you-go | Solid alternative |
| **Yuboto** | ~€0.03/SMS | Greek company, local support | 🇬🇷 Greek provider |

> **Decision needed:** Choose provider. For admin-only OTP (very low volume — maybe 5-10 SMS/month), cost is negligible (~€0.50/mo). If we add consumer phone verification later, volume increases.
>
> **Panagiotis mentioned:** Twilio or another provider — needs final decision.

**Subtotal: ~€5-15/mo estimate (low volume)**

---

## 5. Professional Services

| Service | What | Cost | Billing | Status |
|---------|------|------|---------|--------|
| **Λογιστής** | Monthly accounting, tax filings, VAT | ~€100-150/mo | Monthly | ✅ Active |
| **Δικηγόρος** | Legal — terms, contracts, compliance (as needed) | ~€9/mo (retainer?) or per-case | ❓ | ❓ Verify |

> **Question for Panagiotis:** Τι arrangement έχεις με δικηγόρο; €9/μήνα retainer ή πληρώνεις per case;

**Subtotal: ~€109-159/mo**

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
| **Sentry** | Error monitoring | €0 (free tier) → €26/mo | When team grows |
| **Marketing ads** | Google/Meta/Instagram | €50-200/mo | After first €500 commission earned |
| **Hetzner / bigger VPS** | If traffic exceeds current VPS | €20-40/mo | After 500+ daily visitors |

---

## Cost Scenarios

### Scenario A: Now (pre-revenue, 0 orders)
| | Monthly |
|---|---|
| Infrastructure | €13 |
| AI tools | €40-60 |
| Professional | €109-159 |
| SMS | €0 (not connected) |
| **TOTAL** | **€162-232** |

### Scenario B: Early traction (20-30 orders/mo)
| | Monthly |
|---|---|
| Infrastructure | €13 |
| AI tools | €40-60 |
| Professional | €109-159 |
| SMS | €5 |
| Stripe fees | €25 |
| **TOTAL** | **€192-262** |
| Commission revenue (12% of €1,000) | +€120 |
| **Net burn** | **€72-142** |

### Scenario C: Growing (50-80 orders/mo)
| | Monthly |
|---|---|
| Infrastructure | €13 |
| AI tools | €40-60 |
| Professional | €109-159 |
| SMS | €10 |
| Stripe fees | €63 |
| Marketing | €50-100 |
| **TOTAL** | **€285-405** |
| Commission revenue (12% of €2,500) | +€300 |
| **Net burn** | **-€15 to +€105 → BREAKEVEN ZONE** |

---

## Action Items

- [ ] **Panagiotis**: Confirm exact Gemini subscription cost
- [ ] **Panagiotis**: Confirm lawyer arrangement (retainer vs per-case)
- [ ] **Decide**: SMS/OTP provider for admin login (Twilio vs Telnyx vs Yuboto)
- [ ] **Decide**: When to upgrade Neon from free tier (monitor DB size)
- [ ] Review this doc monthly — update after first real orders

---

_Runway with €5K capital and ~€200/mo burn: **~25 months**_
_Runway improves as commission revenue starts_
