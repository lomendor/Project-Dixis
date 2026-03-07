# Dixis -- Legal Liability Analysis for Food Marketplace in Greece/EU

**Last Updated:** 2026-03-07
**Purpose:** Comprehensive legal liability research for Dixis as an online food marketplace
**Status:** Research document -- NOT legal advice. Consult a Greek lawyer before acting.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [EU Food Safety Regulations](#2-eu-food-safety-regulations)
3. [Greek-Specific Food Law](#3-greek-specific-food-law)
4. [Liability Allocation](#4-liability-allocation)
5. [What Dixis Needs for Protection](#5-what-dixis-needs-for-protection)
6. [Practical Checklist](#6-practical-checklist)
7. [IKE vs Atomiki for Food Marketplace](#7-ike-vs-atomiki-for-food-marketplace)
8. [Risk Matrix](#8-risk-matrix)
9. [Sources](#9-sources)
10. [PSD2 Payment Flow Compliance (CRITICAL)](#10-psd2-payment-flow-compliance-critical)
11. [Additional Findings](#11-additional-findings-2026-03-07) — DAC7, COD trap, Courier contract, Stripe charge type, Omnibus, PSD2 exemption

---

## 1. Executive Summary

Dixis operates as a marketplace intermediary: it connects food producers with consumers, takes a 12% commission, but does NOT produce, store, handle, or ship food. Producers ship directly to consumers. This distinction is legally critical.

**Key findings:**

- Under EU law, Dixis likely does NOT qualify as a "food business operator" (FBO) because it never physically handles food. But this is a grey area -- the EU regulatory framework for online food marketplace intermediaries remains "unclear" (European Commission's own assessment).
- The Digital Services Act (DSA) applies to Dixis as an online marketplace, imposing trader verification (KYBC), transparency, and notice-and-action obligations.
- The new EU Product Liability Directive 2024/2853 (transposition by December 2026) could impose liability on platforms that present products in ways suggesting they are the supplier, or that fail to identify a responsible EU-based party.
- Greek law (Law 2251/1994 as amended) imposes strict product liability on "producers" -- Dixis is not a producer, but if it cannot identify the producer to a claimant, it may be treated as one.
- IKE is strongly recommended over Atomiki for a food marketplace due to limited liability protection.
- Professional liability insurance is essential but not legally mandatory.

**Bottom line:** Dixis has a defensible legal position as a pure intermediary, but ONLY if it implements proper contracts, disclaimers, producer verification, and terms of service. Without these, the grey area could collapse against Dixis.

---

## 2. EU Food Safety Regulations

### 2.1 Regulation (EC) No 178/2002 -- General Food Law

This is the foundational EU food safety regulation. Key provisions relevant to Dixis:

**Article 3 -- Definition of "Food Business Operator" (FBO):**
> "Food business operator" means the natural or legal persons responsible for ensuring that the requirements of food law are met within the food business under their control.

> "Food business" means any undertaking, whether for profit or not and whether public or private, carrying out any of the activities related to any stage of production, processing and distribution of food.

**Critical question: Is Dixis an FBO?**

The answer depends on whether "facilitating a transaction" constitutes "distribution of food." Current EU regulatory analysis suggests:

- **If Dixis ONLY provides the platform (no fulfillment, no storage, no handling):** It is likely NOT an FBO. Online platforms that "never own or/and physically handle food products" are generally considered third-party information society service providers, not food business operators.
- **If Dixis were to store, pack, or ship food:** It would undoubtedly be an FBO.
- **Grey area:** The European Commission has acknowledged that "the allocation of responsibilities through the food chain remains unclear" when it comes to online marketplace intermediaries.

**Article 14 -- Food Safety Requirements:**
Food shall not be placed on the market if it is unsafe. This obligation falls on the FBO, which in Dixis's model is the producer, not the marketplace.

**Article 17 -- Responsibilities:**
FBOs shall ensure compliance with food law at all stages under their control. Dixis does not "control" any stage of food production, processing, or distribution.

**Article 18 -- Traceability:**
Traceability must be established at all stages of production, processing, and distribution. The "one-step-back, one-step-forward" principle applies. For Dixis, this means keeping records of which producer supplied which product and to which consumer. This is something Dixis already does through its order management system.

**Article 19 -- Withdrawal/Recall:**
FBOs must initiate withdrawal procedures if food is not in compliance. This falls on the producer, but Dixis should have a mechanism to facilitate recalls (e.g., notifying affected buyers).

### 2.2 Regulation (EU) No 1169/2011 -- Food Information to Consumers (FIC)

This regulation governs food labeling and information disclosure. Critical for online/distance selling:

**Article 14 -- Distance Selling:**
> For prepacked foods offered for sale by means of distance communication, mandatory food information (except certain particulars like date of minimum durability) shall be available BEFORE the purchase is concluded and shall appear on the material supporting the distance selling (e.g., website) or be provided through other appropriate means without supplementary costs.

**What this means for Dixis:**

- Every product listing on dixis.gr MUST display mandatory food information BEFORE purchase, including:
  - Name of the food
  - List of ingredients
  - Allergens (highlighted/emphasized per Article 21)
  - Net quantity
  - Date of minimum durability / use-by date (at delivery)
  - Name and address of the food business operator (the producer)
  - Country of origin (where required)
  - Nutritional declaration
  - Storage conditions
  - Instructions for use (where applicable)

- For **non-prepacked foods** sold via distance communication, at minimum the 14 major allergens must be disclosed before purchase.

- All mandatory particulars must be available at the **moment of delivery** (on the physical label).

**Liability note:** If Dixis displays incorrect food information provided by a producer, and a consumer suffers harm (e.g., allergic reaction), the question of shared liability arises. Dixis should require producers to certify accuracy of all food information and include an indemnification clause.

### 2.3 Digital Services Act (DSA) -- Regulation (EU) 2022/2065

The DSA applies to Dixis as an "online marketplace" (a platform enabling distance contracts between traders and consumers). Key obligations:

**Article 30 -- Know Your Business Customer (KYBC):**
Before allowing a trader to offer products, Dixis must:
- Collect: Name, address, phone, email of the producer
- Collect: Copy of identity document or electronic identification
- Collect: Payment account details
- Collect: Trade register number (if applicable)
- Obtain: Self-certification that the trader will only offer products complying with EU law
- Make "best efforts" to verify reliability and completeness of this information
- Verification methods: Official online databases (VIES, GEMI register), certified copies of documents

**Article 31 -- Compliance by Design:**
Dixis must design its interface to enable traders (producers) to provide required information:
- Pre-contractual information
- Product safety and compliance information
- Food information (ingredients, allergens, etc.)

**Article 32 -- Right to Information (Consumer Protection):**
If Dixis becomes aware that an illegal product was sold, it must:
- Inform affected consumers
- Provide the identity of the trader
- Provide information about available redress

**Article 16 -- Notice-and-Action:**
Dixis must have easily accessible mechanisms for anyone to notify it of potentially illegal content (including food safety violations). Notices must be processed in a timely, diligent, non-arbitrary, and objective manner.

**Article 22 -- Internal Complaint-Handling:**
Dixis must provide an internal complaint-handling system for recipients of its services.

**Transparency Requirements:**
- Publish trader contact details and self-certification
- Describe content moderation policies in ToS
- Issue annual transparency reports on content moderation activities

**DSA does NOT make Dixis automatically liable for third-party content.** Under Article 6, hosting providers (including marketplaces) are not liable for stored information provided by recipients of the service, as long as they do not have actual knowledge of illegal activity and act expeditiously upon obtaining such knowledge.

### 2.4 EU Product Liability Directive 2024/2853

This NEW directive (transposition deadline: December 9, 2026) significantly updates product liability rules:

**When could Dixis be liable?**
Online platforms can be held liable under specific circumstances:
1. When they present products in ways that would lead consumers to believe the product is provided by the platform itself (e.g., Dixis-branded products)
2. When they enable transactions under their authority or control in a way that creates consumer confusion
3. When they **fail to promptly identify** a relevant economic operator (the producer) established in the EU

**Key protection for Dixis:**
- Online platforms acting "purely as intermediaries" CANNOT be held liable (mirroring DSA principles)
- Liability only crystallizes where the platform creates consumer confusion about the source of products OR fails to identify the responsible party

**Action item:** Ensure every product listing on dixis.gr clearly identifies the producer (name, address, registration number). This is not optional -- it is Dixis's primary defense.

### 2.5 General Product Safety Regulation (EU) 2023/988

This regulation applies from December 13, 2024. However, it explicitly **exempts food products** from its scope (food is covered by Regulation 178/2002 instead). So this regulation does not directly apply to Dixis's core food marketplace operations, though it would apply to any non-food products (e.g., kitchenware) if Dixis ever sells those.

---

## 3. Greek-Specific Food Law

### 3.1 EFET (Hellenic Food Authority) Requirements

EFET is the primary food safety authority in Greece, established in 1999 under the Ministry of Rural Development and Food.

**Registration requirements for food businesses:**
- Notification to EFET at least 15 days before commencing operations
- HACCP (Hazard Analysis and Critical Control Points) implementation
- Premises inspection and approval
- Standard processing timeline: 30-90 days

**Does Dixis need to register with EFET?**

This is the key Greek-specific question. There are two possible interpretations:

1. **Dixis as information society service (not FBO):** If Dixis is classified purely as a digital intermediary (not a food business operator), it would not need to register with EFET as a food business. It would instead need standard e-commerce registrations.

2. **Dixis as a food distribution facilitator:** If Greek authorities interpret "distribution" broadly to include online marketplace facilitation, EFET registration could be required. However, there is no clear precedent for this in Greece.

**CTO recommendation:** Proactively contact EFET (info@efet.gr / 213 2145800) and ask directly whether a food marketplace intermediary that does not handle food needs to register. Get the answer in writing. This costs nothing and eliminates ambiguity.

**What EFET definitely requires from Dixis's producers:**
- Each producer MUST be a registered food business with EFET
- Each producer MUST have HACCP procedures documented and implemented
- Each producer MUST comply with food labeling requirements
- Each producer MUST have food handler training certificates

### 3.2 Greek Food Code

The basic national food regulatory act is the Code of Foodstuffs, Beverages and Objects of Common Use (Kodikos Trofimon kai Potimon -- KTP), introduced in 1971, codified by Ministerial Decision 1100/1987. This establishes the framework for food production, labeling, and safety standards in Greece, implementing EU regulations into national practice.

### 3.3 Greek Consumer Protection Law -- Law 2251/1994

This law transposed EU Directive 85/374/EEC (Product Liability Directive) into Greek law. Key provisions:

**Product Liability (Strict Liability):**
- Greece implements strict liability for defective products -- the producer is liable regardless of fault
- Three conditions must be met: defective product exists, damage occurred, and causation is established
- Covers: death, personal injury, property damage exceeding EUR 500, and moral harm

**Who is "Producer":**
- Manufacturer of finished product or raw material
- Anyone who presents themselves as producer (via branding, trademark)
- EU importers
- **Critical:** If the producer CANNOT be identified, the SUPPLIER becomes liable unless it discloses the actual producer's identity

**Defenses available (Article 6):**
1. Product was not placed on the market
2. No intention to circulate the product commercially
3. Defect did not exist when product was placed on market
4. Manufacture complied with mandatory regulations
5. State-of-the-art defense: scientific knowledge at the time could not discover the defect

**Time limits:**
- 3-year prescription for damage recovery claims
- 10-year absolute limit from when product was placed on market
- 5-year prescription for general tort claims (20-year absolute limit)

**Burden of proof:**
- Claimant must prove defect, damage, and causation
- BUT: Greek case law reverses burden when facts lie exclusively within the defendant's control

**Non-waivable liability:**
> No contractual clause may allow the producer to limit his liability in relation to the injured person.

This means Dixis cannot use ToS to limit the PRODUCER's liability to consumers. However, Dixis can structure ToS to clarify that DIXIS is not the producer.

### 3.4 Law 4933/2022 -- Digital Consumer Protection

This law transposed EU Directive 2019/2161 (Omnibus Directive) into Greek law. Key additions:

- Explicit definition of "online marketplace" and "online marketplace provider"
- Marketplace providers must inform consumers whether they are entering a B2C or C2C transaction
- Failure to provide information about product ranking parameters is a "misleading omission"
- Marketplace providers must disclose how contractual obligations are shared between the marketplace and the trader

### 3.5 E-Commerce Law in Greece

Greek e-commerce law requires online sellers to provide:
- Full identity and contact details of the business
- Clear pricing including taxes and delivery costs
- Right of withdrawal (14-day cooling-off period for distance contracts under EU Consumer Rights Directive)
- Pre-contractual information

**Note on right of withdrawal for food:** Under EU Consumer Rights Directive 2011/83/EU (Article 16), the right of withdrawal does NOT apply to sealed food products that have been unsealed after delivery, or to goods that deteriorate or expire rapidly. This is important for Dixis.

---

## 4. Liability Allocation

### 4.1 Who is Liable: Producer, Marketplace, or Both?

Under the current legal framework, liability is allocated as follows:

| Scenario | Primary Liability | Dixis Liability | Notes |
|----------|------------------|-----------------|-------|
| Food poisoning from product | **Producer** (FBO) | None (if producer identified) | Producer is FBO under Reg 178/2002 |
| Allergic reaction (undisclosed allergen) | **Producer** (labeling obligation) | Potential (if info not on listing) | Dixis must ensure allergen info is displayed per Reg 1169/2011 |
| Wrong product delivered | **Producer** (shipping) | None (Dixis does not ship) | Producer controls fulfillment |
| Product not as described on listing | **Producer** + potentially Dixis | Possible shared liability | If Dixis controls product description display |
| Expired product delivered | **Producer** | None (if producer identified) | Producer controls inventory |
| Consumer data breach | **Dixis** | Yes (data controller) | GDPR applies to Dixis directly |
| Producer cannot be identified | Dixis (as "supplier") | **Yes -- full liability** | Under Law 2251/1994, supplier liable if producer unidentifiable |
| Platform presents product as its own | **Dixis** | **Yes** | Under PLD 2024/2853 |

### 4.2 The Critical Risk: Producer Identification

Under both Greek Law 2251/1994 and the new EU PLD 2024/2853, if a consumer suffers harm and the PRODUCER cannot be identified, the entity that supplied or facilitated the product can become liable.

**For Dixis, this means:**
- EVERY product listing MUST clearly show the producer's identity (legal name, address, EFET registration)
- EVERY producer MUST be verified and identifiable
- Dixis MUST maintain records of all producer information
- If a consumer asks who the producer is, Dixis MUST be able to answer immediately

This is not optional. This is the single most important legal protection Dixis can implement.

### 4.3 Food Business Operator Status -- Analysis

| Factor | Points toward FBO | Points away from FBO |
|--------|------------------|---------------------|
| Owns/handles food | No | Dixis never touches food |
| Stores food | No | No warehouse/fulfillment |
| Ships food | No | Producer ships directly |
| Controls food quality | No | Producer controls quality |
| Sets food prices | Partially (displays them) | Producer sets prices |
| Presents as food source | Risk if branding is ambiguous | Clear if producer is prominently shown |
| Makes food purchasing decisions | No | Producer decides what to sell |
| Selects/curates producers | Yes (admission criteria) | This is marketplace curation, not food control |

**Assessment:** Dixis is most likely NOT an FBO under current EU law, provided it maintains clear separation between its role as platform and the producer's role as food business. However, this classification has never been definitively tested in Greek courts for food marketplaces specifically.

### 4.4 Intermediary Liability Protection

Under the E-Commerce Directive (2000/31/EC) and the DSA, information society services (including marketplaces) benefit from a liability exemption for third-party content IF:
- They do not have actual knowledge of illegal activity/content
- Upon obtaining knowledge, they act expeditiously to remove or disable access

This means Dixis is NOT obligated to proactively monitor every product listing for food safety compliance. BUT once Dixis is informed of a problem (via notice, complaint, or recall), it MUST act immediately.

---

## 5. What Dixis Needs for Protection

### 5.1 Terms of Service (ToS) -- Required Clauses

The ToS displayed on dixis.gr must include:

**For Consumers:**
1. **Clear intermediary status declaration:** "Dixis is an online marketplace that connects food producers with consumers. Dixis does not produce, store, handle, or ship any food products. All food products are produced and shipped directly by independent producers listed on the platform."
2. **Producer identification:** Each product listing identifies the responsible producer
3. **Food information disclaimer:** "Food information (ingredients, allergens, nutritional values) is provided by the producer. While Dixis requires producers to provide accurate information, Dixis cannot independently verify all food information."
4. **Allergen warning:** "If you have food allergies, contact the producer directly before purchasing. Dixis cannot guarantee allergen-free environments."
5. **Right of withdrawal exclusions:** Perishable foods and unsealed food products are exempt from 14-day withdrawal
6. **Complaint handling:** How consumers can report issues
7. **Dispute resolution:** Greek courts, applicable law, alternative dispute resolution

**For Producers (separate agreement -- see 5.2):**
These would be in a separate Producer Agreement, not the consumer-facing ToS.

### 5.2 Producer Agreement/Contract -- Required Clauses

Every producer on Dixis MUST sign a Producer Agreement before being listed. Required clauses:

1. **FBO Declaration:** Producer declares it is a registered food business operator with EFET and complies with all applicable food law
2. **HACCP Compliance:** Producer maintains HACCP-based food safety management
3. **Accurate Information:** Producer guarantees accuracy of all food information (ingredients, allergens, nutritional values, shelf life, storage conditions)
4. **Indemnification:** Producer indemnifies Dixis against all claims arising from product defects, food safety incidents, inaccurate labeling, or regulatory non-compliance. Specific wording:
   > "The Producer agrees to indemnify, defend, and hold harmless Dixis and its owners, directors, employees, and agents from and against any and all claims, damages, losses, costs, and expenses (including legal fees) arising from or relating to: (a) any defect in the Producer's products; (b) any inaccuracy in food information provided by the Producer; (c) any failure to comply with applicable food safety regulations; (d) any personal injury or property damage caused by the Producer's products."
5. **Insurance requirement:** Producer must maintain product liability insurance (recommended minimum: EUR 100,000 per claim)
6. **Document submission:** Producer must provide copies of: EFET registration, HACCP documentation, business license, tax registration (AFM), food handler certificates
7. **Recall cooperation:** Producer must cooperate with product recalls and notify Dixis immediately of any food safety issues
8. **Labeling compliance:** All products must comply with EU Regulation 1169/2011
9. **Shipping compliance:** Producer is responsible for proper packaging, cold chain (if applicable), and timely delivery
10. **Termination:** Dixis can terminate the agreement immediately for food safety violations
11. **Commission terms:** 12% commission structure, payment terms

### 5.3 Certifications/Documents Required from Producers

**Mandatory (before listing):**

| Document | What | Why |
|----------|------|-----|
| EFET Registration | Proof of registration as food business with EFET | Legal requirement for all FBOs |
| Business License | Operating license from municipality | Confirms legal business operation |
| AFM (Tax Number) | Tax registration number | DSA KYBC requirement |
| GEMI Registration | Commercial register extract (if company) | DSA KYBC requirement |
| Identity Document | ID or passport of owner/legal representative | DSA KYBC requirement |
| HACCP Documentation | HACCP plan or certificate | Food safety compliance proof |
| Food Handler Certificate | Training certification | Confirms proper food handling knowledge |
| Product Labels | Sample labels for review | Verify Reg 1169/2011 compliance |
| Self-Certification | Signed declaration of EU law compliance | DSA Article 30 requirement |

**Recommended (additional assurance):**

| Document | What | Why |
|----------|------|-----|
| Product Liability Insurance | Insurance policy details | Financial protection for claims |
| Lab Test Results | Product testing (if applicable) | Quality/safety verification |
| Organic/PDO Certifications | If products are marketed as organic, PDO, etc. | Prevent fraudulent claims |
| Previous Inspection Reports | EFET inspection results | Verify ongoing compliance |

### 5.4 Professional Liability Insurance

**Is it legally required?**
No. There is no Greek or EU law that mandates professional liability insurance for online food marketplace intermediaries.

**Is it strongly recommended?**
Yes. Even though Dixis is not the producer, legal defense costs alone from a single food safety claim could be devastating for a small company.

**Types of insurance to consider:**

| Type | What it covers | Estimated annual cost | Priority |
|------|---------------|----------------------|----------|
| Professional Liability (E&O) | Negligence claims (e.g., failing to remove unsafe listing) | EUR 500-2,000 | HIGH |
| General Liability | Third-party bodily injury or property damage claims | EUR 300-1,000 | HIGH |
| Cyber/Data Liability | Data breach, GDPR violations | EUR 300-800 | MEDIUM |
| Directors & Officers (D&O) | Personal liability of company administrators (IKE) | EUR 500-1,500 | MEDIUM (if IKE) |

**Estimated total insurance cost:** EUR 1,000-3,000/year (EUR 85-250/month)

**Where to get quotes in Greece:**
- Contact insurance brokers specializing in SME/startup coverage
- Lloyd's of Greece has specialized commercial liability products
- Ethniki Insurance, Allianz Greece, Eurolife FFH, AXA Greece all offer business liability products
- Specifically ask for "professional liability for online marketplace/e-commerce"

### 5.5 Disclaimers -- What Works and What Doesn't

**Disclaimers that provide SOME protection:**
- "Dixis is a marketplace intermediary and does not produce or handle food"
- "Food information is provided by producers; Dixis cannot independently verify accuracy"
- "Consumers with allergies should contact producers directly"

**Disclaimers that have NO legal effect:**
- "Dixis is not liable for any harm from products sold through the platform" -- This is unenforceable if Dixis has actual liability
- Any clause that attempts to limit the producer's strict liability to the consumer (prohibited under Greek Law 2251/1994 Article 6(7))
- Any clause that tries to waive consumer rights under mandatory consumer protection law

**Key principle:** Disclaimers supplement but do not replace structural protections (clear producer identification, proper contracts, insurance).

---

## 6. Practical Checklist

### 6.1 Documents Dixis Needs

| Document | Status | Priority | Est. Cost |
|----------|--------|----------|-----------|
| Terms of Service (consumer-facing) | NEEDED | CRITICAL | EUR 100-300 (lawyer) |
| Producer Agreement/Contract | NEEDED | CRITICAL | EUR 100-300 (lawyer) |
| Privacy Policy (GDPR) | LIKELY EXISTS | HIGH | EUR 0-100 (update) |
| Cookie Policy | LIKELY EXISTS | MEDIUM | EUR 0 (template) |
| Refund/Returns Policy | NEEDED | HIGH | EUR 50-100 (lawyer) |
| Allergen Disclaimer | NEEDED | CRITICAL | EUR 0 (draft in-house, review by lawyer) |
| Complaint Handling Procedure | NEEDED | HIGH (DSA) | EUR 0 (draft in-house) |

**Estimated total legal document cost:** EUR 300-800 (one-time, via lawyer at EUR 100/case rate)

### 6.2 Producer Onboarding Checklist

Before listing ANY producer on Dixis:

- [ ] Collect legal name, address, phone, email
- [ ] Collect copy of identity document (ID/passport)
- [ ] Collect AFM (tax number)
- [ ] Collect GEMI registration (if company) or business license
- [ ] Verify information against official databases (VIES, GEMI)
- [ ] Collect EFET food business registration proof
- [ ] Collect HACCP documentation or certificate
- [ ] Collect food handler training certificate
- [ ] Obtain signed Producer Agreement with indemnification
- [ ] Obtain self-certification of EU law compliance (DSA requirement)
- [ ] Review sample product labels for Reg 1169/2011 compliance
- [ ] Verify product listing information (ingredients, allergens, etc.)
- [ ] Confirm shipping capabilities (packaging, cold chain if needed)
- [ ] Collect product liability insurance details (if available)
- [ ] Set up producer profile with visible identification on platform

### 6.3 Website Disclaimers to Display

**On every product page:**
- Producer name and location
- "This product is produced and sold by [Producer Name]. Dixis facilitates the transaction but does not produce, store, or handle this product."

**On checkout page:**
- "By completing this purchase, you are entering into a direct contract with the producer(s) listed above. Dixis acts as intermediary."
- Allergen warning for consumers with food allergies

**In footer/legal section:**
- Link to full Terms of Service
- Link to Privacy Policy
- Complaint reporting mechanism
- "Dixis is an online marketplace connecting consumers with independent food producers. Dixis does not produce, store, or handle food products."

### 6.4 EFET Notification/Registration

**Action required:** Contact EFET directly to clarify whether Dixis needs to register.

- **Contact:** info@efet.gr / Call Center: 213 2145800
- **Address:** 124 Kifissias Ave. & 2 Iatridou Str, 115 26 Athens
- **Ask specifically:** "We operate an online marketplace (dixis.gr) connecting food producers with consumers. We do not produce, store, handle, or ship food. The producers ship directly to consumers. We take a commission on sales. Do we need to register with EFET as a food business? If so, what classification and what documents do we need?"
- **Get the answer in writing** (email preferred)

### 6.5 Insurance Recommendations

**Immediate (before reaching 50 orders/month):**
1. Get quotes from 2-3 Greek insurance brokers for professional liability + general liability
2. Budget EUR 1,000-2,000/year (EUR 85-165/month)
3. Minimum coverage: EUR 100,000 per claim

**When growing (100+ orders/month):**
1. Add cyber/data liability coverage
2. Increase coverage limits
3. Consider D&O insurance (if IKE)

### 6.6 Return/Refund Policy Framework

Based on EU consumer protection law and Greek implementation:

**Shelf-stable food products (honey, olive oil, jams, herbs, nuts, etc.):**
- Note: Dixis sells ONLY shelf-stable, locker-compatible products (NO cheese, NO dairy, NO refrigerated items)
- These are still classified as "food products" for return purposes — exempted from 14-day withdrawal right once opened/unsealed
- NO returns for change of mind once product seal is broken
- Returns accepted ONLY for: defective product, wrong item shipped, expired product
- Consumer must report within **48 hours** of delivery
- Consumer must provide **photographic evidence** of the issue
- If producer's fault → producer covers return shipping
- If consumer changed mind (non-perishable only) → consumer covers return shipping

**Non-perishable products:**
- Standard 14-day withdrawal right applies
- Product must be unused and in original packaging
- Return shipping costs: consumer pays (unless defective)

**Key implementation notes:**
- Terms of Service must clearly state perishable exemptions
- Producer Agreement must define who pays for defective product returns
- Platform needs a simple complaint form (DSA requirement)
- Monthly settlement reports should track returns per producer

---

## 7. IKE vs Atomiki for Food Marketplace

This is a critical business decision with significant legal implications for a food marketplace.

### 7.1 Liability Comparison

| Factor | Atomiki (Sole Proprietor) | IKE (Private Limited Company) |
|--------|--------------------------|------------------------------|
| **Legal identity** | Owner = business (no separation) | Separate legal entity |
| **Personal liability** | UNLIMITED -- owner liable for ALL business debts and claims | LIMITED to capital contribution |
| **Food safety claim** | Claimant can go after personal assets (house, savings, car) | Claimant can only go after company assets |
| **If someone gets sick from a product** | Even as intermediary, legal defense costs + potential liability hit personal assets | Legal defense costs + potential liability hit company assets only |
| **Piercing the corporate veil** | N/A (no veil to pierce) | Possible but rare -- requires fraud, commingling of assets, or failure to maintain corporate formalities |
| **Creditor protection** | None | Strong (if corporate formalities maintained) |

### 7.2 Cost Comparison (from MONTHLY-COSTS.md)

| | Atomiki | IKE | Difference |
|---|---|---|---|
| Accountant (monthly) | EUR 150 | EUR 400 | +EUR 250 |
| Formation cost | Minimal | EUR 30-200 | One-time |
| EFKA (admin) | Variable | EUR 126/mo | - |
| Minimum capital | None | EUR 1 | Negligible |
| Annual cost difference | -- | -- | ~EUR 3,000/year |

### 7.3 Risk Analysis for Food Marketplace Specifically

**Scenario: A consumer has a severe allergic reaction to a product purchased on Dixis.**

| Step | Atomiki outcome | IKE outcome |
|------|----------------|-------------|
| Consumer files claim | Against Panagiotis personally | Against Dixis IKE |
| Legal defense costs (est.) | EUR 2,000-10,000 from personal funds | EUR 2,000-10,000 from company funds |
| If Dixis found liable | Judgment against personal assets | Judgment against company assets only |
| If judgment exceeds company assets | Personal bankruptcy risk | Company folds, personal assets protected |
| If producer indemnifies Dixis | Recovery through producer agreement | Same, but personal assets never at risk |

**Scenario: EFET fines Dixis for a regulatory violation.**

| | Atomiki | IKE |
|---|---|---|
| Fine | Personal liability | Company liability |
| Failure to pay | Personal asset seizure | Company dissolution at worst |

### 7.4 B2B Considerations

When Dixis expands to B2B (7% commission, restaurants/hotels as buyers):
- B2B customers strongly prefer contracting with companies (IKE/EPE/AE), not sole proprietors
- B2B food supply contracts require higher liability standards
- IKE provides the legal structure needed for B2B credibility

### 7.5 IKE Protection Limits

IKE does NOT protect against:
- Personal tax/social security debts of the administrator
- Personal guarantees given by the administrator (avoid giving these)
- Fraud or intentional wrongdoing by the administrator
- Failure to maintain corporate formalities (keep business/personal finances separate)

### 7.6 Recommendation

**IKE is the correct choice for a food marketplace.** The EUR 250/month additional cost (EUR 3,000/year) is the price of personal asset protection in a business category (food) with inherent liability risk. A single food safety incident under Atomiki could result in personal financial ruin.

The question is not whether the extra EUR 250/month is affordable. The question is whether Panagiotis can afford to lose his personal assets if something goes wrong. With food, something CAN go wrong -- that is why the entire EU regulatory framework for food safety exists.

---

## 8. Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Consumer allergic reaction | MEDIUM | HIGH | Allergen info on listings, producer responsibility, disclaimers |
| Food poisoning from product | LOW-MEDIUM | VERY HIGH | Producer verification, HACCP requirements, recall procedure |
| EFET fine for non-registration | LOW | MEDIUM | Proactively contact EFET, register if required |
| Producer provides false information | MEDIUM | HIGH | Producer Agreement with indemnification, verification process |
| Consumer data breach (GDPR) | LOW | HIGH | Security practices, data minimization, cyber insurance |
| DSA non-compliance | MEDIUM | MEDIUM | Implement KYBC, transparency, notice-and-action |
| Product liability claim against Dixis | LOW | HIGH | Clear producer identification, intermediary status, IKE, insurance |
| Platform classified as FBO | LOW | MEDIUM | Do not handle/store/ship food, clear intermediary positioning |

---

## 9. Sources

### EU Regulations

- [Regulation (EC) No 178/2002 -- General Food Law](https://eur-lex.europa.eu/eli/reg/2002/178/oj/eng)
- [Regulation (EU) No 1169/2011 -- Food Information to Consumers](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex:32011R1169)
- [Digital Services Act -- Regulation (EU) 2022/2065](https://digital-strategy.ec.europa.eu/en/policies/digital-services-act)
- [Directive (EU) 2024/2853 -- Product Liability Directive](https://eur-lex.europa.eu/eli/dir/2024/2853/oj/eng)
- [Regulation (EU) 2023/988 -- General Product Safety Regulation](https://eur-lex.europa.eu/eli/reg/2023/988/oj/eng)
- [Distance Selling -- Food Information Requirements (EC)](https://food.ec.europa.eu/food-safety/labelling-and-nutrition/food-information-consumers-legislation/distance-selling_en)

### Greek Law

- [Product Liability Laws and Regulations -- Greece (ICLG 2025)](https://iclg.com/practice-areas/product-liability-laws-and-regulations/greece)
- [Law 4933/2022 -- Changes to Greek Consumer Protection Law (ZK Law Firm)](https://www.zklawfirm.gr/2022/06/09/law-4933-2022-changes-to-greek-consumer-protection-law/)
- [Greek Consumer Protection Law (Abogados Gold)](https://abogadosgold.com/legislation/greek-consumer-protection-law/)
- [Changes in Greek Civil Code -- Consumer Protection (Zepos & Yannopoulos)](https://www.zeya.com/newsletters/changes-greek-civil-code-regarding-sale-goods-and-amendments-consumers-protection-law)
- [Food & Beverage Regulation in Greece (Greek Law Digest)](https://www.greeklawdigest.gr/component/k2/item/108-food-beverage)
- [E-Commerce Law in Greece (Pantazis Law)](https://www.pantazis-law.com/index.php/en/content/76/e-commerce)

### EFET / Food Safety

- [EFET -- Hellenic Food Authority](https://www.efet.gr/index.php/en/)
- [EFET Registered Establishments](https://efet.gr/index.php/en/food-companies/registered-establishments)
- [Food Safety Standards in Greece (Comprehensive Guide)](https://alekcarreraestates.com/2025/06/04/food-safety-standards-and-regulations-in-greece/)
- [Greece Food Regulatory Overview (DigiComply)](https://www.digicomply.com/food-regulatory-bodies-standards-and-authorities/greece)

### DSA / Platform Obligations

- [DSA Requirements for Online Marketplaces (Taylor Wessing)](https://www.taylorwessing.com/en/insights-and-events/insights/2023/09/requirements-for-online-marketplaces)
- [New KYBC Obligations for Online Platforms (Taylor Wessing)](https://www.taylorwessing.com/en/interface/2022/the-eus-digital-services-act/new-kybc-obligations-for-online-platforms)
- [Online Marketplaces Accountability under DSA (Compliance & Risks)](https://www.complianceandrisks.com/blog/online-marketplaces-are-accountable-for-products-sold-on-their-platforms-eu-digital-services-act/)
- [KYBC -- Paradigm Shift for Online Marketplaces (Ondorse)](https://www.ondorse.co/blog/kybc-the-paradigm-shift-for-online-marketplaces)

### Product Liability

- [EU Product Liability Directive -- Impact on Supply Chain (Reed Smith)](https://www.reedsmith.com/articles/eu-product-liability-directive/)
- [New EU PLD for Non-EU Manufacturers (Bird & Bird)](https://www.twobirds.com/en/insights/2025/eu-revised-product-liability-directive-2024-navigating-the-new-liability-framework-for-noneu-manufac)
- [Commercial Intermediation Company as FBO (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12606525/)
- [EU Online Food Sales Regulatory Challenges (KH Law)](https://tomorrowsfoodandfeed.khlaw.com/2020/01/how-online-sales-of-food-pose-a-regulatory-challenge-in-the-eu/)

### IKE / Business Structure

- [IKE Company Formation in Greece (Leptokaridou Law)](https://leptokaridou.com/en/corporate-law-greece/formation-ike-greece/)
- [IKE Private Company Overview (Mertiri Legal)](https://mertiri.com/private-company-ike/)
- [What is an IKE in Greece (My Greek Expat Journey)](https://www.mygreekexpatjourney.com/post/start-a-private-limited-company-in-greece-what-is-an-ike)
- [Greece Company Formation Cost 2025-2026 (Soneverse)](https://www.soneverse.com/greece-company-formation-cost-2025/)
- [Sole Proprietorship in Greece (Deel)](https://www.deel.com/blog/sole-proprietorship-greece/)

### Insurance

- [Food Product Liability Insurance (FLIP)](https://www.fliprogram.com/blog/food-product-liability-insurance)
- [Financial Impact of Food Contamination (GrECo)](https://greco.services/the-financial-impact-of-a-food-contamination-outbreak/)
- [Lloyd's Greece](https://www.lloyds.com/greece)

---

## 10. PSD2 Payment Flow Compliance (CRITICAL)

**Added: 2026-03-07** — Identified from additional research documents.

### The Risk

Under PSD2 (Payment Services Directive 2, EU Directive 2015/2366), if a platform:
1. Receives customer payments into its own account
2. Then distributes funds to sellers/producers

...it may be classified as providing **payment services**, which requires a license from the national central bank (Bank of Greece / Τράπεζα της Ελλάδος).

Operating as an unlicensed payment service provider is a **serious regulatory violation** with potential fines and criminal liability.

### Current Dixis Status: ✅ ALREADY MITIGATED

Good news: **Dixis has already implemented Stripe Connect** (Express accounts). The code exists in:
- `backend/app/Services/Payment/StripeConnectService.php` — Full implementation
- `backend/app/Http/Controllers/Api/Producer/StripeConnectController.php` — API endpoints
- `backend/database/migrations/2026_03_02_100000_add_stripe_connect_fields.php` — DB schema

The payment model uses **"Separate Charges & Transfers"**:
- Customer pays Dixis (via Stripe) → Payment goes to Dixis's Stripe platform account
- Webhook triggers Transfer to producer's connected Stripe Express account
- Commission is retained automatically (the transfer amount = order total minus commission)

**However**, the Stripe Connect feature is behind a **feature flag** (`STRIPE_CONNECT_ENABLED=false` by default). This means:
- Currently, payments go to Dixis's Stripe account but transfers to producers are NOT automatic
- Producers are paid manually (bank transfer or other means)

### Required Actions

1. **Enable Stripe Connect before going live with real producers** — Set `STRIPE_CONNECT_ENABLED=true`
2. **Onboard each producer onto Stripe Express** — They must complete Stripe's KYC/identity verification
3. **Never manually hold and redistribute customer funds** — Always use Stripe Connect transfers
4. **Document the payment flow** — Show your lawyer that funds flow: Customer → Stripe → Producer (minus commission to Dixis)

### Why Stripe Connect Solves PSD2

Stripe is a licensed Payment Service Provider (PSP) in the EU. When using Stripe Connect:
- Dixis operates under Stripe's license (as a "marketplace" on Stripe's platform)
- Dixis never directly holds customer funds — Stripe does
- Transfers to producers are handled by Stripe, a licensed entity
- This is the standard PSD2-compliant model used by Etsy, Deliveroo, and similar EU marketplaces

### Stripe Connect Additional Benefits for DSA/KYBC

Stripe Express accounts automatically collect:
- Producer identity (passport/ID)
- Tax ID (AFM)
- Bank account (IBAN)
- Address verification

This data satisfies a significant portion of the DSA Article 30 KYBC requirements.

---

## 11. Additional Findings (2026-03-07)

New compliance issues identified from cross-referencing multiple AI legal analyses (Gemini, GPT-4). These need verification with a marketplace-specialized accountant.

### 11.1 DAC7 — Platform Seller Reporting (Ν. 5047/2023)

**What:** EU Directive DAC7, transposed into Greek law as Ν. 5047/2023, requires digital platforms (marketplaces) to:
- Collect tax identification details from all sellers (producers)
- Report annually to AADE (Greek tax authority) how much each seller earned through the platform
- Suspend sellers who refuse to provide their tax details

**Why it matters:** Significant fines for non-compliance. This is NOT optional — it's a legal obligation for any marketplace operating in the EU.

**Status:** NOT YET ADDRESSED. Must ask marketplace accountant how to implement this reporting.

**Action:** Ask accountant: "What exactly does DAC7 require from us? How do we report seller earnings to AADE?"

### 11.2 Cash on Delivery (Antikatavoli) — PSD2 Trap

**What:** Stripe Connect solves PSD2 for card payments. But COD creates the SAME problem:
- Customer pays cash to courier
- Courier deposits to a bank account
- **If that account is Dixis's** → Dixis is handling third-party funds → PSD2 violation
- **If that account is the producer's** → How does Dixis collect its 12% commission?

**Current status:** COD is enabled in Dixis (`payments.cod_enabled = true`).

**This is an unsolved problem.** Common marketplace solutions:
1. Courier deposits to producer → Dixis invoices producer monthly for commission (risk: producer doesn't pay)
2. Courier deposits to Dixis → but then needs PSD2 compliance or commercial agent exemption
3. Disable COD entirely (lose ~50-60% of Greek e-commerce customers)

**Action:** Ask marketplace accountant: "How do Skroutz/e-food handle COD deposits and commission collection?"

### 11.3 Courier Contract — Who Signs?

**What:** The choice of who holds the courier contract affects invoicing:
- **Option A: Each producer has own courier contract** — Clean legally (producer invoices shipping), but loses bulk rate discounts
- **Option B: Dixis signs master courier contract** — Better rates (e.g., €3/package vs €5), but courier invoices Dixis → creates invoicing complexity (who re-invoices shipping to customer?)

**Current implementation:** Dixis has ACS integration built into the platform. The practical question of contract ownership is unresolved.

**Action:** Ask accountant: "If the courier contract is in Dixis's name, how do we handle the shipping invoicing chain?"

### 11.4 Stripe Charge Type — Legal Implications

**What:** Dixis uses "Separate Charges & Transfers" model (confirmed in code). This means:
- Customer payment lands on Dixis's Stripe platform account FIRST
- Then a Transfer is created to the producer's connected account
- **Disputes and refunds hit Dixis's platform account**, not the producer's

**Why it matters:** With this model, Dixis IS in the payment flow — it's NOT the same as "never touching money." The statement descriptor on the customer's bank statement likely shows "Dixis" (not the producer name), which undermines the "pure intermediary" argument.

Alternative: **Direct charges** would make the charge happen on the producer's connected account directly. Customer sees producer name. Disputes hit producer. Dixis only gets application_fee. This is "cleaner" for the intermediary narrative, BUT has practical downsides (producer needs fully onboarded Stripe account).

**Current code location:** `StripePaymentProvider.php` line 87 — `$this->stripe->paymentIntents->create(...)` creates charge on platform account.

**Action:** Ask accountant AND potentially Stripe support: "For a food marketplace, which charge model is legally cleanest? Separate charges & transfers, or direct charges?"

### 11.5 Omnibus Directive — Ranking Transparency

**What:** The EU Omnibus Directive (transposed to Greek law) requires marketplaces to:
- Clearly state whether the seller is a professional or individual (for Dixis: all are professionals)
- **Explain in Terms of Service how product/search ranking works** — Why does Producer A appear before Producer B?

**Current status:** Our product listing/search does not have documented ranking criteria.

**Action:** Add ranking methodology explanation to Terms of Service (e.g., "Products are ranked by [date added / relevance / sales volume / alphabetical]").

### 11.6 PSD2 Commercial Agent Exemption — Weaker Than Expected

**What:** The EBA (European Banking Authority) has clarified that the "commercial agent" exemption from PSD2 only applies if the platform acts as agent for ONE side (typically the seller). If the platform represents BOTH buyer AND seller (which a marketplace arguably does — it handles disputes, refunds, customer support), the exemption is weaker.

**Why it matters:** Even with Stripe Connect, if Dixis's Terms of Service, UX, support flow, and refund handling make it look like Dixis represents both parties, a regulator could argue it's providing payment services.

**Mitigation:** Ensure all customer-facing materials consistently position the producer as the seller and Dixis as the facilitator. Refund flows should go through the producer, not be initiated unilaterally by Dixis.

---

## Appendix: Priority Actions (Ordered)

1. **DECIDED: IKE** ✅ — Limited liability protection for food marketplace. (Decision: 2026-03-07)
2. **CRITICAL: Find marketplace-specialized accountant** — Most legal/tax questions below need this person. Priority #1.
3. **CRITICAL: Enable Stripe Connect** — Turn on `STRIPE_CONNECT_ENABLED=true` and onboard producers before processing real payments. PSD2 compliance.
4. **CRITICAL: Resolve COD PSD2 trap** — Who receives cash? How does Dixis get commission? Ask accountant. (Section 11.2)
5. **CRITICAL: Evaluate Stripe charge model** — Separate charges vs direct charges. Which is legally cleanest? Ask accountant + Stripe. (Section 11.4)
6. **Contact EFET** — Ask about registration requirements for food marketplace intermediary. Get answer IN WRITING.
7. **Draft Producer Agreement** — Have lawyer review. Include indemnification, FBO declaration, document requirements.
8. **Draft/Update Terms of Service** — Clear intermediary status, allergen warnings, complaint handling, ranking transparency (Omnibus).
9. **Implement DAC7 reporting** — Annual seller earnings report to AADE. Ask accountant for exact requirements. (Section 11.1)
10. **Resolve courier contract ownership** — Who signs with ACS? Invoicing implications. Ask accountant. (Section 11.3)
11. **Implement Producer Onboarding Checklist** — Collect all required documents before listing any producer.
12. **Add Product Page Disclaimers** — Producer identification, intermediary status on every listing.
13. **Get Insurance Quotes** — Professional liability + general liability. Budget EUR 1,000-2,000/year.
14. **Implement DSA Compliance** — KYBC verification, notice-and-action mechanism, transparency.
15. **Set Up Recall/Complaint Procedure** — How to handle food safety incidents.
16. **Annual Review** — Review legal compliance annually, update contracts as regulations change (especially PLD 2024/2853 transposition by Dec 2026).

---

_This document is research-grade analysis based on publicly available legal sources. It is NOT legal advice. Dixis should have a Greek lawyer (specializing in food law and/or e-commerce law) review all contracts, terms, and compliance procedures before implementation. Estimated one-time legal review cost: EUR 300-500._
