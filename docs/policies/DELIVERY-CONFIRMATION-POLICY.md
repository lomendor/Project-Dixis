# Πολιτική Επιβεβαίωσης Παράδοσης — Dixis

> Τελευταία ενημέρωση: Φεβρουάριος 2026
> Εσωτερικό έγγραφο (ops + development reference)

---

## Σκοπός

Καθορίζει πότε μια παραγγελία θεωρείται "παραδοθείσα" — κρίσιμο γιατί:
1. Ξεκινάει η 14ήμερη περίοδος αναμονής πριν το payout στον παραγωγό
2. Ξεκινάει το 14ήμερο παράθυρο dispute για τον πελάτη
3. Ενεργοποιεί τις ενημερώσεις status στον πελάτη

## Hybrid Model

### 1. Primary: Courier Tracking API (Αυτόματο)

- **Trigger**: Status "delivered" (DELIVERED) από ACS courier API
- **Αυτοματοποιημένο**: Webhook ή polling ενημερώνει `Shipment.status → delivered`
- **Αξιοπιστία**: Υψηλή — courier επιβεβαιώνει με timestamp και location
- **Καλύπτει**: ~85% περιπτώσεων

### 2. Fallback: Auto-confirm (7 ημέρες) + Email Safeguard

- **Trigger**: 7 ημερολογιακές ημέρες μετά status "shipped" / "in_transit" χωρίς νέο update
- **Λογική**: Αν δεν υπάρχει complaint και ο courier δεν ενημέρωσε, πιθανότατα παραδόθηκε
- **Αυτοματοποιημένο**: Scheduled job (cron) ελέγχει ημερησίως
- **Εξαιρέσεις**: Δεν εφαρμόζεται αν υπάρχει ανοιχτό complaint/dispute

**Email Safeguard (υποχρεωτικό πριν auto-confirm)**:
- Στις 5 ημέρες μετά "shipped" (48h πριν auto-confirm), ο πελάτης λαμβάνει email:
  > "Η παραγγελία σας (#ΧΧΧΧ) θα θεωρηθεί παραδοθείσα εντός 48 ωρών.
  > Αν δεν την έχετε λάβει, παρακαλούμε ενημερώστε μας."
- Αν ο πελάτης αντιδράσει (απάντηση ή click "δεν παρέλαβα") → **cancel auto-confirm**, admin review
- Αν ο πελάτης δεν αντιδράσει εντός 48h → auto-confirm προχωρά

### 3. Override: Admin Manual (Χειροκίνητο)

- **Trigger**: Admin πατά "Confirm Delivery" ή "Flag as Issue" στο admin panel
- **Χρήσεις**:
  - Πελάτης επιβεβαιώνει τηλεφωνικά
  - Courier δεν ενημέρωσε αλλά υπάρχει απόδειξη
  - Dispute: παραγωγός ισχυρίζεται ότι παρέδωσε, πελάτης αρνείται
- **Priority**: Υψηλότερο — admin override υπερισχύει αυτοματισμών

## Timeline μετά Confirmation

```
Delivery Confirmed (Day 0)
  │
  ├── Day 0-14: Hold period (δεν εκκαθαρίζεται στον παραγωγό)
  │              Πελάτης μπορεί να ανοίξει dispute
  │
  ├── Day 14: Eligible for payout
  │            Εντάσσεται στην επόμενη μηνιαία εκκαθάριση
  │
  └── Day 14+: Settlement batch (1η μήνα)
               IBAN transfer στον παραγωγό
```

## Edge Cases

| Σενάριο | Αντιμετώπιση |
|---------|-------------|
| Courier λέει "delivered" αλλά πελάτης λέει ΟΧΙ | Admin flag → investigation → manual resolution |
| 7 μέρες χωρίς update + complaint | Auto-confirm **δεν** τρέχει, μένει σε "in_transit" |
| Αποτυχημένη παράδοση (status "failed") | Παραγωγός ειδοποιείται, νέα αποστολή ή refund |
| Πελάτης αρνείται παραλαβή (COD) | Epistrofh sto paragi, shipping cost → πελάτης |

## Implementation Notes

- `Shipment.status` enum: `pending → labeled → in_transit → delivered → failed`
- `Shipment.delivered_at`: Timestamp επιβεβαίωσης (null αν δεν έχει γίνει)
- Auto-confirm cron: Ελέγχει `shipped_at + 7 days` όπου `delivered_at IS NULL AND status != 'failed'`
- Admin override: `PUT /api/admin/shipments/{id}/confirm-delivery`

---

*Αυτή η πολιτική θα εξελιχθεί με βάση τα πραγματικά δεδομένα μετά τις πρώτες παραδόσεις.*
