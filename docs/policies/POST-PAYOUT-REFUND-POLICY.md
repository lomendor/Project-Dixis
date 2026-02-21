# Πολιτική Refund μετά Payout — Dixis

> Τελευταία ενημέρωση: Φεβρουάριος 2026
> Εσωτερικό έγγραφο (ops + finance reference)

---

## Πρόβλημα

Τι γίνεται αν χρειαστεί refund σε πελάτη **αφού** το ποσό έχει ήδη εκκαθαριστεί στον παραγωγό;

Αυτό μπορεί να συμβεί σε σπάνιες περιπτώσεις:
- Πελάτης ανακαλύπτει πρόβλημα μετά τις 14 μέρες hold
- Chargeback μέσω Stripe (πελάτης αμφισβητεί χρέωση)
- Ελαττωματικό που ανακαλύφθηκε αργά (π.χ. κρυφό ελάττωμα)

## Phased Approach

### Phase 1: Τώρα (0-20 παραγωγοί) — Case-by-case

**Μηχανισμός**: Manual review + Dixis absorbs (με cap)
- Κάθε περίπτωση εξετάζεται ξεχωριστά από admin
- Η Dixis απορροφά το κόστος refund (ως κόστος λειτουργίας)

**Monthly Cap (safeguard)**:
- Dixis absorbs μέχρι **€100/μήνα ή 3% of GMV** (ό,τι είναι μικρότερο)
- Πέρα από αυτό το όριο: ο υπεύθυνος παραγωγός χρεώνεται (αφαίρεση από επόμενο payout)
- Σε περίπτωση **3+ refund incidents ανά τρίμηνο** από τον ίδιο παραγωγό: η Dixis δικαιούται να χρεώσει τον παραγωγό ή/και να αναστείλει τη συνεργασία (βλ. Producer Agreement, Άρθρο 7)

**Γιατί**: Σε μικρό scale, τα refunds θα είναι σπάνια (εκτιμώμενο <2% παραγγελιών). Το cap προστατεύει από exploitation χωρίς να δημιουργεί τριβές σε κανονικές περιπτώσεις.

**Tracking**: Κάθε post-payout refund καταγράφεται σε spreadsheet (ημερομηνία, ποσό, λόγος, παραγωγός, resolution).

### Phase 2: 20-50 παραγωγοί — Negative Balance

**Trigger**: Όταν τα post-payout refunds ξεπεράσουν τα €200/μήνα ή 3+ περιστατικά/μήνα.

**Μηχανισμός**:
- Αν γίνει refund μετά payout, δημιουργείται **negative balance** στον λογαριασμό του παραγωγού
- Το negative balance αφαιρείται από τα **επόμενα payouts**
- Maximum withhold: 50% του επόμενου payout (ο παραγωγός δεν μένει ποτέ χωρίς εισόδημα)
- Αν ο παραγωγός τερματίσει τη συνεργασία με αρνητικό υπόλοιπο: τακτοποίηση εντός 30 ημερών

**Ειδοποίηση**: Ο παραγωγός ενημερώνεται ΑΜΕΣΑ (email + dashboard notification) για κάθε deduction.

**Implementation**: `CommissionSettlement` model ήδη υποστηρίζει adjustments — χρειάζεται:
- Νέο πεδίο `adjustment_amount` στο settlement
- Dashboard notification component
- Email template

### Phase 3: 50+ παραγωγοί — Reserve Buffer

**Trigger**: Όταν τα chargebacks ξεπεράσουν 1% του GMV ή υπάρχουν παραγωγοί με ιστορικό θεμάτων.

**Μηχανισμός**:
- **5% reserve** κρατείται από κάθε payout σε νέους παραγωγούς
- Αποδεσμεύεται μετά **6 μήνες** clean history (0 disputes, 0 refunds)
- Seasoned producers (6+ μήνες, 0 issues): 0% reserve
- Reserve account: Ξεχωριστός sub-account (trust account)

**Graduated release**:
| Μήνες | Clean History | Reserve |
|-------|--------------|---------|
| 0-3 | — | 5% |
| 3-6 | 0 issues | 3% |
| 6+ | 0 issues | 0% |

## Chargeback Handling

Τα Stripe chargebacks (disputes initiated by cardholder's bank):
1. **Stripe ειδοποιεί** → Dixis admin notified
2. **Evidence submission**: 7 μέρες deadline — Dixis υποβάλλει proof (tracking, delivery, comms)
3. **Αν χαθεί**: Dixis απορροφά (Phase 1) ή negative balance (Phase 2+)
4. **Αν κερδηθεί**: Κανένα impact

## Decision Matrix

| Σενάριο | Phase 1 | Phase 2 | Phase 3 |
|---------|---------|---------|---------|
| Refund <€20 | Dixis absorbs | Dixis absorbs | Dixis absorbs |
| Refund €20-100 | Case-by-case | Negative balance | Reserve + negative |
| Refund >€100 | Case-by-case + review | Negative balance (50% cap) | Reserve covers if available |
| Chargeback | Dixis absorbs | Negative balance | Reserve + negative |
| Repeat offender (3+ issues) | Warning + review | Suspension + negative | Termination |

---

*Η πολιτική αυτή είναι εσωτερική. Ο πελάτης ενημερώνεται μόνο ότι "η επιστροφή χρημάτων επεξεργάζεται" — δεν χρειάζεται να γνωρίζει τους εσωτερικούς μηχανισμούς.*
