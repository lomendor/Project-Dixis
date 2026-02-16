# Deep Research Prompt: Marketplace Payouts, Refunds & Compliance

Copy-paste the section below into ChatGPT Deep Research (or Claude with web search).

---

## PROMPT START

I'm building a **Greek online marketplace** called **Dixis** (dixis.gr) that connects small Greek food producers (olive oil, honey, cheese, wine, herbs, etc.) directly with consumers. Think of it as an Etsy/Shopify marketplace specifically for Greek agricultural products.

### Current State
- **Live in production** with real producers joining
- **Payment methods**: Stripe (card) + Cash on Delivery (COD) with +4 EUR fee
- **Multi-producer orders**: A single checkout can contain products from multiple producers, creating separate sub-orders per producer
- **Commission system**: Built but not yet activated. Configurable rules (% per order, can vary by channel B2C/B2B, by producer, by category, by order amount tier). Default: 12% B2C, 7% B2B.
- **No payout system yet**: Producers are not yet being paid through the platform
- **No refund system yet**: Order model has refund fields but no workflow
- **Based in Greece**, serving Greek market primarily
- **Tech stack**: Laravel 11 backend + Next.js frontend + Stripe

### What I Need Researched

Please research the following areas comprehensively, with specific focus on **Greek/EU legal requirements** and **best practices from similar European marketplaces**:

#### A. Producer Payout Mechanism

1. **How do European food marketplaces handle producer payouts?**
   - Specifically look at: Farmdrop (UK, closed but documented), CrowdFarming (Spain), Markthalle (Germany), La Ruche qui dit Oui / The Food Assembly (France), Etsy (global but relevant model)
   - How often do they pay producers? (weekly, bi-weekly, monthly, per-order)
   - What's the typical hold period before payout? (days after delivery, after refund window)
   - Do they use Stripe Connect, PayPal, direct bank transfer, or other?

2. **Stripe Connect options for a Greek marketplace**
   - Standard vs Express vs Custom accounts — which is best for small Greek producers?
   - What KYC/onboarding is required for Greek producers on Stripe Connect?
   - Can we use "destination charges" or "separate charges and transfers"?
   - What are Stripe Connect fees in Greece/EUR?
   - Alternative to Stripe Connect: can we just collect payments and do manual bank transfers?

3. **Greek legal requirements for marketplace payouts**
   - Does Dixis need a **Payment Agent License** or **E-Money License** from Bank of Greece?
   - What does **PSD2** require for marketplace payment splitting?
   - Is there an exemption for small marketplaces (limited network exemption)?
   - What about the **Commercial Agent** model — can Dixis act as agent for producers?
   - Do we need to be registered with AADE (Greek tax authority) as a payment intermediary?
   - What's the simplest legally compliant way to handle producer payouts in Greece?

4. **Settlement cycle design**
   - What's a reasonable settlement period? (7, 14, 30 days after delivery?)
   - Should we batch settlements (weekly/monthly) or pay per-order?
   - Minimum payout threshold? (e.g., no payout under 20 EUR)
   - How to handle the "rolling reserve" / payout hold for potential refunds?
   - What happens to pending settlements when a producer leaves the platform?

#### B. Refund & Return Policy

5. **EU Consumer Rights for food products sold online**
   - Does the 14-day EU withdrawal right apply to food/perishable products?
   - What exceptions exist for perishable goods?
   - What about non-perishable food (olive oil, honey, dried herbs)?
   - Who is liable for refund: the marketplace (Dixis) or the producer?

6. **Refund flow in a marketplace context**
   - Customer wants refund → who decides? (Dixis, producer, or automatic?)
   - Partial refunds (some items damaged, others fine)
   - Refund when producer has already been paid out
   - Refund when using COD (cash on delivery) — how to return money?
   - Chargeback handling: Stripe chargeback hits Dixis, but the money went to producer

7. **What refund/return policies do similar marketplaces use?**
   - Look at: CrowdFarming, The Food Assembly, Etsy food sellers, Amazon Fresh
   - Typical refund windows for food products
   - Photo evidence requirements for damaged goods
   - Who pays return shipping for food items?

#### C. Tax & Invoicing

8. **VAT and invoicing requirements in Greece**
   - Does Dixis need to issue invoices (timologia) to consumers? Or is the producer the seller?
   - How does VAT work? Does Dixis charge VAT on the commission?
   - Does the producer charge VAT on the product price?
   - Do we need to issue a "self-invoice" for the commission?
   - What tax documents do producers need from Dixis for their accountant?

9. **Commission invoicing**
   - Should Dixis invoice producers for the commission (they pay us)?
   - Or should producers invoice Dixis for the net amount (we pay them)?
   - What's the correct Greek accounting treatment?

#### D. Best Practices & Recommendations

10. **What would you recommend as the simplest compliant MVP for a Greek food marketplace?**
    - Minimum viable payout system
    - Minimum viable refund policy
    - What to have ready before first real producer payout
    - Common mistakes small marketplaces make with payments/payouts
    - When does it make sense to invest in Stripe Connect vs manual transfers?

11. **Scaling considerations**
    - At what volume (orders/month, producers, GMV) do we need more sophisticated systems?
    - When should we move from manual to automated payouts?
    - When do regulatory requirements change (e.g., PSD2 exemption limits)?

### Output Format

Please structure your response as:

1. **Executive Summary** (1 paragraph: the simplest compliant path for launch)
2. **Payout Mechanism** (detailed analysis with recommendation)
3. **Legal/Compliance** (Greek-specific requirements with sources)
4. **Refund Policy** (recommended policy text + implementation notes)
5. **Tax/Invoicing** (what documents we need to generate)
6. **Implementation Roadmap** (phased approach: MVP → Growth → Scale)
7. **Red Flags / Things to Avoid** (common marketplace mistakes)

For each section, please cite specific EU regulations, Greek laws, or marketplace examples where possible.

## PROMPT END
