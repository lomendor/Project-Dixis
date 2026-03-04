# B2B Readiness Plan

> **Status**: Research complete, no implementation yet
> **Last updated**: 2026-03-04
> **Priority**: After B2C testing phase

---

## 1. B2B Concept

Επιχείρηση (εστιατόριο, ξενοδοχείο, μαγαζί) → αίτηση → admin εγκρίνει → ψωνίζει με **7% commission** αντί 12%.

Ο B2B πελάτης χρησιμοποιεί το ίδιο checkout με τον B2C, αλλά:
- Πληρώνει χαμηλότερη προμήθεια (7%)
- Λαμβάνει τιμολόγιο αντί απόδειξης

---

## 2. Τι ΕΧΟΥΜΕ ήδη

| Κομμάτι | Κατάσταση |
|---|---|
| Commission engine με B2B rules (7% flat) | ✅ Χτισμένο, flag OFF |
| Stripe Connect για payouts σε παραγωγούς | ✅ Χτισμένο, flag OFF |
| Multi-producer orders (parent-child) | ✅ Δουλεύει |
| Producer AFM, ΔΟΥ, IBAN πεδία | ✅ Υπάρχουν στο DB |

---

## 3. Τι ΛΕΙΠΕΙ

| Κομμάτι | Effort | Σημειώσεις |
|---|---|---|
| `is_b2b` flag στον χρήστη | S | Boolean + admin toggle |
| B2B registration φόρμα | M | Επωνυμία, ΑΦΜ, ΔΟΥ, δραστηριότητα |
| Admin approve/reject B2B | M | Σαν τους παραγωγούς ήδη |
| ΦΠΑ πεδίο ανά προϊόν | S | `vat_rate` field (13%, 24% κτλ) |
| Checkout: channel B2B | S | Αν `is_b2b=true` → commission 7% |
| Τιμολόγηση (invoicing) | L | Εξωτερικός πάροχος — βλ. παρακάτω |

---

## 4. Τιμολόγηση — Πάροχοι

### Σύσταση: **Elorus + Fuse**

- **Κόστος**: ~23€/μήνα (17€ Elorus + 6€ Fuse, ετήσια χρέωση)
- **API**: REST API, εξαιρετικό documentation στα English (developer.elorus.com)
- **myDATA**: Πιστοποιημένος πάροχος ΑΑΔΕ (YPAIES)
- **Τι κάνει**: Εκδίδει τιμολόγιο, υποβάλλει στο myDATA, παίρνει ΜΑΡΚ, φτιάχνει PDF, στέλνει email

### Εναλλακτικοί

| Πάροχος | Κόστος/μήνα | API | English Docs |
|---|---|---|---|
| Elorus + Fuse | ~23€ | Εξαιρετικό | Ναι |
| Workadu | Από 9.90€ | Καλό | Ναι |
| EINVOICING (Softone) | Per-transaction | Μέτριο | Όχι |
| Oxygen Pelatologio | 20€ | Μέτριο | Όχι |

### Δωρεάν εναλλακτική (higher risk)

- PHP package: `firebed/aade-mydata` (composer require firebed/aade-mydata)
- Στέλνει απευθείας στο myDATA API χωρίς πάροχο
- Κόστος: 0€, αλλά αναλαμβάνεις εσύ compliance + PDF generation
- **Κίνδυνος**: Μπορεί να μην καλύπτει τον νόμο χωρίς πιστοποιημένο πάροχο

---

## 5. Integration Flow (με Elorus)

```
B2B παραγγελία στο Dixis
    │
    ▼
Laravel Backend
    │
    ├─► POST Elorus API: Create Contact (αν νέος B2B πελάτης)
    │       - Επωνυμία, ΑΦΜ, ΔΟΥ, διεύθυνση
    │
    ├─► POST Elorus API: Create Invoice
    │       - Line items από παραγγελία
    │       - ΦΠΑ rates ανά προϊόν
    │       - Όροι πληρωμής
    │
    ▼
Elorus αυτόματα:
    - Υποβάλλει στο myDATA μέσω Fuse
    - Παίρνει ΜΑΡΚ (μοναδικός κωδικός ΑΑΔΕ)
    - Δημιουργεί PDF + QR code
    - Στέλνει email στον B2B πελάτη
    │
    ▼
Webhook → Dixis: Τιμολόγιο εκδόθηκε, ΜΑΡΚ αποθηκεύεται στο DB
```

---

## 6. ΦΠΑ — Συντελεστές Τροφίμων

| Κατηγορία | Ηπειρωτική | Νησιά (μειωμένος) |
|---|---|---|
| Τυποποιημένα τρόφιμα | 13% | 9% |
| Κρασί, ποτά | 24% | 17% |
| Βασικά αγαθά (ψωμί, γάλα) | 6% | 4% |

Κάθε προϊόν χρειάζεται πεδίο `vat_rate` στο DB.

---

## 7. Νομικό Χρονοδιάγραμμα

| Ημερομηνία | Τι γίνεται |
|---|---|
| 2 Μαρτίου 2026 | Υποχρεωτική B2B ηλ. τιμολόγηση (τζίρος >1M€) |
| 1 Οκτωβρίου 2026 | Υποχρεωτική για ΟΛΕΣ τις επιχειρήσεις |

**Κίνητρο πρώιμης υιοθέτησης**: 100% πρόσθετη απόσβεση εξοπλισμού/λογισμικού + 100% αύξηση εκπιπτόμενων δαπανών τιμολόγησης για 12 μήνες.

---

## 8. Implementation Order (όταν έρθει η ώρα)

1. **Phase 1** — B2B Registration + Approval (χωρίς τιμολόγιο)
   - `is_b2b` flag στο User model
   - Φόρμα αίτησης B2B (επωνυμία, ΑΦΜ, ΔΟΥ)
   - Admin panel: approve/reject
   - Checkout: `channel: "B2B"` → 7% commission

2. **Phase 2** — Invoicing (Elorus integration)
   - Εγγραφή σε Elorus + Fuse
   - Laravel integration με Elorus API
   - Αυτόματη έκδοση τιμολογίου σε κάθε B2B παραγγελία
   - Αποθήκευση ΜΑΡΚ στο DB

3. **Phase 3** — B2B Extras (optional)
   - Volume pricing / χονδρική τιμολόγηση
   - Bulk orders / CSV import
   - Πληρωμή με πίστωση (net-30)
   - B2B dashboard με analytics

---

## Links

- [Elorus API Docs](https://developer.elorus.com/)
- [Elorus Fuse (myDATA)](https://www.elorus.com/el/integrations/paroxos-hlektronikis-timologisis/)
- [ΑΑΔΕ myDATA Portal](https://www.aade.gr/en/mydata)
- [firebed/aade-mydata (PHP)](https://github.com/firebed/aade-mydata)
- [mydata-client (TypeScript)](https://github.com/yiannis-spyridakis/mydata-client)
