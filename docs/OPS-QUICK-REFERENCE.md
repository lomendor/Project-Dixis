# Ops Quick Reference — Dixis

> **Σκοπός**: Γρήγορη αναφορά για καθημερινή λειτουργία. "Τι κάνω ΤΩΡΑ όταν..."
> Για πλήρεις όρους βλ. `docs/policies/`

---

## Παραγγελία ολοκληρώθηκε κανονικά

→ Email αυτόματο (Resend) ✅
→ Courier pickup → tracking → delivery → auto-confirm (7 ημέρες)
→ Payout: eligible μετά 14-day hold, settlement 1η κάθε μήνα, min €20

---

## "Δεν έφτασε η παραγγελία μου"

1. Τσέκαρε tracking στο ACS
2. Αν courier λέει "delivered" αλλά πελάτης αρνείται → Admin investigation
3. Αν >7 ημέρες χωρίς update → χειροκίνητη επιβεβαίωση ή refund
4. **Σημείωση**: Ημέρα 5 στέλνεται warning email στον πελάτη ("auto-confirm σε 48h")

→ Full policy: `docs/policies/DELIVERY-CONFIRMATION-POLICY.md`

---

## "Ήρθε σπασμένο / λάθος προϊόν"

1. Ζήτα **φωτογραφία εντός 48 ωρών**
2. Admin review εντός 48 εργάσιμων ωρών
3. Αποτέλεσμα: **Αντικατάσταση Ή refund** (επιλογή πελάτη)
4. Κόστος:
   - Λάθος παραγωγού → **παραγωγός πληρώνει** return shipping
   - Ζημιά στη μεταφορά → **Dixis πληρώνει**
   - Αλλαγή γνώμης → **πελάτης πληρώνει** (μόνο μη ευπαθή)

→ Full policy: `docs/policies/RETURN-REFUND-POLICY.md`

---

## "Θέλω επιστροφή χρημάτων"

| Τύπος | Επιστροφή; | Προθεσμία |
|---|---|---|
| Ευπαθή τρόφιμα | ΟΧΙ εκτός ελαττώματος/λάθους/ληγμένου | 48 ώρες report |
| Μη ευπαθή | ΝΑΙ, κλειστή συσκευασία | 14 ημέρες |

**Χρόνος refund**: 3-7 εργάσιμες (κάρτα), 5 εργάσιμες (αντικαταβολή → τράπεζα)

→ Full policy: `docs/policies/RETURN-REFUND-POLICY.md`

---

## Refund ΜΕΤΑ από payout στον παραγωγό

- Phase 1 (0-20 producers): **Dixis απορροφά**, cap €100/μήνα ή 3% GMV
- Repeat offender (3+/τρίμηνο): χρέωση στον παραγωγό ή αναστολή
- Chargebacks: 7 ημέρες deadline για evidence σε Stripe

→ Full policy: `docs/policies/POST-PAYOUT-REFUND-POLICY.md`

---

## Νέος παραγωγός θέλει να μπει

| Βήμα | Τι γίνεται | URL |
|---|---|---|
| 1. Εγγραφή | Φόρμα: επωνυμία, τηλ, πόλη, περιοχή | `/producer/onboarding` |
| 2. Admin approve | Αλλαγή status → active | Admin dashboard |
| 3. Προϊόντα | Ανέβασμα με Product Quality Checklist | `/my/products/create` |
| 4. IBAN | Πριν το πρώτο payout (GR, 27 χαρακτήρες) | `/producer/settings` |

**Στείλε**: Producer Agreement (`docs/policies/PRODUCER-AGREEMENT.md`) — γραπτή αποδοχή

---

## Product Quality Checklist

Πριν κάνεις approve ένα προϊόν:

- [ ] **3+ φωτογραφίες** (800×800 min, φυσικός φωτισμός, χωρίς watermarks)
- [ ] **Τίτλος** σαφής, ≤80 χαρακτήρες (π.χ. "Εξαιρετικό Παρθένο Ελαιόλαδο Κορωνέικο 500ml")
- [ ] **Περιγραφή** ≥100 χαρακτήρες: τι είναι / πώς φτιάχτηκε / τι το κάνει ξεχωριστό
- [ ] **Βάρος/μονάδα** ακριβές (κρίσιμο για υπολογισμό shipping)
- [ ] **Αλλεργιογόνα** σημειωμένα αν υπάρχουν (EU 1169/2011 — 14 βασικά)
- [ ] **Τιμή** λογική, **stock** ενημερωμένο
- [ ] **Χωρίς**: ψευδείς ισχυρισμοί υγείας, copyright photos, στοιχεία επικοινωνίας εκτός πλατφόρμας

→ Full standard: `docs/policies/PRODUCER-CONTENT-GUIDELINES.md`

---

## Χρήσιμα Links

| Τι | URL |
|---|---|
| Admin dashboard | `dixis.gr/admin` |
| Producer onboarding | `dixis.gr/producer/onboarding` |
| Product creation | `dixis.gr/my/products/create` |
| Producer settings/IBAN | `dixis.gr/producer/settings` |
| Producer settlements | `dixis.gr/producer/settlements` |
| Policies | `docs/policies/` (5 αρχεία) |
| Health check | `dixis.gr/api/healthz` |

---

_Created: 2026-02-21 | Quick reference — links to full policies in docs/policies/_
