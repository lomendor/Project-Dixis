# Dixis — Payout Research Findings

**Date:** 2026-02-16
**Sources:** Bank of Greece, EU Directives, Stripe docs, IBAN standards, Greek VAT law

---

## 1. Executive Summary

**Simplest compliant path for launch:** Use Stripe Connect Express accounts for producers. Stripe holds the payment license (PSD2-compliant, EU-passported), handles KYC, and manages payouts. Dixis never touches the money directly — Stripe splits payments at checkout time. This avoids the need for a Bank of Greece payment institution license.

**Alternative for MVP:** Collect payments via Stripe (as now), manually transfer to producer IBANs via bank. Legal if Dixis acts as commercial agent (not payment intermediary). Consult Greek lawyer to confirm agent model.

---

## 2. Greek Legal Requirements

### PSD2 & Licensing (Law 4537/2018)

| Requirement | Details |
|-------------|---------|
| **Who regulates** | Bank of Greece (Τράπεζα Ελλάδος) |
| **Law** | 4537/2018 (transposes PSD2 into Greek law) |
| **License types** | Payment Institution (PI), E-Money Institution (EMI) |
| **Agent model** | PI/EMI can operate through agents (notification to BoG required) |
| **Passporting** | EU-licensed PI/EMI can operate in Greece via passport |

### Does Dixis Need a License?

**If using Stripe Connect:** NO. Stripe is the licensed payment institution. Dixis is a "platform" using Stripe's services. Stripe handles SCA, KYC, PSD2 compliance.

**If doing manual bank transfers:** GREY AREA.
- If Dixis collects payment and then transfers to producers → potentially acting as payment intermediary → may need PI license
- If Dixis acts as **commercial agent** of producers (Εμπορικός Αντιπρόσωπος) → may be exempt under PSD2 Article 3(b) "commercial agent" exemption
- **Recommendation:** Consult Greek fintech lawyer before manual payout model. Cost: ~€500-1000 for legal opinion.

### Upcoming: PSD3 (2026-2028)
- Proposal published June 2023
- Expected transposition deadline: 2026-2028
- Stricter marketplace payment rules anticipated
- **Risk:** Manual payout model may become non-compliant under PSD3

---

## 3. Stripe Connect Options

### Account Types

| Type | KYC Burden | Customization | Best For |
|------|-----------|---------------|----------|
| **Express** | Stripe handles | Medium | ✅ **Recommended for Dixis** |
| Standard | Producer does own | Low | Large/sophisticated sellers |
| Custom | Platform handles | Full | Enterprise platforms |

### Why Express for Dixis:
- Producers fill minimal info (name, IBAN, tax ID)
- Stripe handles KYC verification
- Hosted onboarding dashboard
- Dixis controls payout timing
- 0% fee for EUR→EUR payouts within EEA

### Payment Flow with Connect

```
Consumer pays → Stripe holds funds → Split:
  ├── Platform fee (12%) → Dixis Stripe account
  └── Producer amount (88%) → Producer's Connected Account → Auto-payout to IBAN
```

### Fees (Greece/EUR)
- Card processing: 1.4% + €0.25 (EU cards)
- Connect platform fee: 0.25% + €0.25 per payout (or 0% for manual payouts)
- Cross-border within EEA: 0%
- Payout to bank: Free (standard), €0.50 (instant)

### Implementation Effort
- Stripe Connect Express integration: ~300-500 LOC across 3-5 PRs
- Producer onboarding flow: Stripe-hosted (minimal frontend)
- Webhook handling for payout events: ~100 LOC

---

## 4. IBAN Specifications (Greece)

| Property | Value |
|----------|-------|
| **Country code** | GR |
| **Total length** | 27 characters |
| **Format** | GR + 2 check digits + 3 bank code + 4 branch + 16 account |
| **Regex** | `^GR\d{25}$` |
| **Example** | GR16 0110 1250 0000 0001 2300 695 |

### Validation
- Length: exactly 27 characters
- Starts with "GR"
- Followed by 25 digits
- Mod-97 checksum validation (ISO 13616)

---

## 5. VAT & Invoicing

### Commission VAT Treatment
- Platform fee is a **service** provided by Dixis to the producer
- Subject to standard VAT rate: **24%**
- Dixis must issue a **τιμολόγιο παροχής υπηρεσιών** (service invoice) to each producer for the commission
- OR use **self-billing** (αυτοτιμολόγηση) where the platform issues the invoice on behalf of the producer

### myDATA Requirement
- All invoices must be reported to AADE via myDATA
- Dixis needs myDATA integration (or use an approved ERP/invoicing provider)
- Invoices not reported to myDATA are invalid for VAT deduction

### Practical Approach for MVP
1. Commission invoices can be generated monthly (batch)
2. Use a Greek invoicing SaaS (e.g., Elorus, Apylon, or Tim) with myDATA integration
3. Each settlement period → generate invoice per producer for commission amount

---

## 6. Refund Policy for Food Products

### EU Consumer Rights Directive (2011/83/EU)

| Category | 14-Day Withdrawal Right | Notes |
|----------|:-----------------------:|-------|
| Perishable food (cheese, meat, dairy) | ❌ **Exempt** | Article 16(d): goods liable to deteriorate rapidly |
| Non-perishable food (olive oil, honey, dried herbs) | ✅ **Applies** | Must accept returns within 14 days |
| Sealed food opened by consumer | ❌ **Exempt** | Article 16(e): sealed goods not suitable for return due to health/hygiene |

### Recommended Dixis Refund Policy
1. **Perishable products:** No refund right, BUT quality guarantee (damaged/wrong item → full refund with photo evidence)
2. **Non-perishable products (sealed):** 14-day return right if unopened
3. **Defective/damaged products:** Full refund regardless of category, with photo proof within 48h of delivery
4. **Refund method:** Original payment method (Stripe refund for card, bank transfer for COD)
5. **Who pays return shipping:** Producer (if defective), Consumer (if change of mind)

---

## 7. Settlement Cycle Design

### Recommended Parameters

| Parameter | Recommended | Why |
|-----------|-------------|-----|
| **Settlement frequency** | Monthly (1st of each month) | Simplest for accounting, matches Greek tax periods |
| **Hold period** | 14 days after delivery | Covers EU withdrawal window for non-perishable |
| **Minimum payout** | €20 | Avoids micro-transfers, reduces banking costs |
| **Payout method** | Bank transfer (IBAN) initially, Stripe Connect later | Start simple, upgrade when volume justifies |
| **COD settlement** | After admin confirms receipt of cash | COD requires manual reconciliation |

### Settlement Lifecycle
```
Order delivered → 14-day hold → Eligible for settlement →
Monthly batch → Admin reviews → Mark as "Paid" → Bank transfer
```

---

## 8. Recommendations for Dixis

### Phase 1: MVP Payout (NOW — can start)
1. ✅ Add IBAN field to Producer profile
2. Build settlement generation (artisan command, monthly batch)
3. Admin dashboard to view/export/mark settlements as paid
4. Manual bank transfers via admin's bank (CSV export of IBANs + amounts)
5. **Legal:** Get lawyer opinion on commercial agent model (~€500)

### Phase 2: Automate (When >10 producers, >50 orders/month)
1. Integrate Stripe Connect Express
2. Automatic payment splitting at checkout
3. Automated payouts to producer bank accounts
4. Webhook handling for payout status updates

### Phase 3: Full Compliance (When >€1M GMV/year)
1. myDATA integration for commission invoices
2. Automated tax document generation
3. Consider PSD3 compliance requirements

---

## 9. Owner Decision Points

| Decision | Options | Default Recommendation |
|----------|---------|----------------------|
| Turn on commission flag? | Now / After 1st producer | After 1st real producer order |
| Commission rate B2C? | 10% / 12% / 15% | 12% (industry standard for food) |
| Payout frequency? | Weekly / Bi-weekly / Monthly | Monthly |
| Minimum payout threshold? | €0 / €10 / €20 | €20 |
| Hold period? | 7 / 14 / 30 days | 14 days |
| IBAN required when? | Onboarding / Before 1st payout | Before 1st payout |
| Legal consultation? | Now / Later | NOW (before 1st manual payout) |

---

## Sources

- [Bank of Greece — PSD2 Information](https://www.bankofgreece.gr/en/main-tasks/supervision/psd2-info)
- [Bank of Greece — Authorization](https://www.bankofgreece.gr/en/main-tasks/supervision/financial-institutions/authorisation)
- [Stripe Connect Documentation](https://docs.stripe.com/connect)
- [Stripe Connect Marketplace Guide](https://docs.stripe.com/connect/marketplace)
- [EU Consumer Rights Directive — EUR-Lex](https://eur-lex.europa.eu/EN/legal-content/summary/consumer-information-right-of-withdrawal-and-other-consumer-rights.html)
- [EU Returns & Withdrawal Rights](https://europa.eu/youreurope/citizens/consumers/shopping/returns/index_en.htm)
- [Greek IBAN Format](https://bank-code.net/iban/structure/greece-international-bank-account-number)
- [Greece VAT Guide 2025](https://www.vatcalc.com/greece/greece-vat-guide/)
- [Greece E-Invoicing / myDATA](https://www.fonoa.com/resources/country-tax-guides/greece/e-invoicing-and-digital-reporting)
- [Chambers Banking Regulation 2026 — Greece](https://practiceguides.chambers.com/practice-guides/banking-regulation-2026/greece/trends-and-developments)
