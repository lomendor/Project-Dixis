# Stripe Connect: Current Flow vs Target — Note for Accountant/Lawyer

**Date:** March 2026
**Status:** Code built, feature flag OFF, zero production transactions

---

## Current Implementation: Separate Charges & Transfers (SCT)

```
Πελάτης (Κάρτα)
    │
    ▼
┌──────────────────────────────┐
│  Stripe PaymentIntent        │
│  Charge on DIXIS account     │  ← Η χρέωση γίνεται στον λογαριασμό DIXIS
│  (€100.00)                   │
└──────────────┬───────────────┘
               │
               │  Webhook: payment_intent.succeeded
               ▼
┌──────────────────────────────┐
│  Dixis Backend               │
│  Υπολογίζει:                 │
│  - Commission: €12.00 (12%)  │
│  - Transfer: €88.00          │
└──────────────┬───────────────┘
               │
               │  Stripe Transfer API
               ▼
┌──────────────────────────────┐
│  Producer Connected Account  │
│  (Express)                   │
│  Λαμβάνει: €88.00            │
└──────────────────────────────┘
```

### Τι σημαίνει αυτό:

| Χαρακτηριστικό | SCT (Τρέχον) |
|---|---|
| **Ποιος φαίνεται ως merchant** | DIXIS |
| **Statement descriptor πελάτη** | "DIXIS" ή "DIXIS*Παραγωγός" |
| **Disputes/chargebacks** | Πηγαίνουν στον λογαριασμό DIXIS |
| **Refunds** | Η DIXIS κάνει refund + reverse transfer |
| **PSD2 risk** | ΥΨΗΛΟ — η DIXIS εισπράττει ΚΑΙ μεταφέρει |
| **Ποιος κρατάει τα χρήματα** | DIXIS (platform account) |
| **Stripe fees** | Χρεώνονται στη DIXIS |

### PSD2 Red Flags:

1. **Η DIXIS δρα και για τους δύο** — εισπράττει για τον αγοραστή, πληρώνει τον πωλητή
2. **Commercial Agent Exemption** — κατά EBA, ισχύει ΜΟΝΟ αν εκπροσωπείς ΜΙΑ πλευρά
3. **Τα χρήματα περνούν από τον λογαριασμό DIXIS** — δεν πάνε απευθείας στον παραγωγό

---

## Target: Direct Charges (Εναλλακτικό Μοντέλο)

```
Πελάτης (Κάρτα)
    │
    ▼
┌──────────────────────────────┐
│  Stripe PaymentIntent        │
│  Charge on PRODUCER account  │  ← Η χρέωση γίνεται στον λογαριασμό ΠΑΡΑΓΩΓΟΥ
│  on_behalf_of: acct_xxx      │
│  application_fee: €12.00     │  ← Η DIXIS παίρνει αυτόματα fee
│  (€100.00)                   │
└──────────────┬───────────────┘
               │
               │  Stripe αυτόματα:
               ├─► €88.00 → Producer Connected Account
               └─► €12.00 → Dixis Platform Account (application_fee)
```

### Τι αλλάζει:

| Χαρακτηριστικό | Direct Charges (Target) |
|---|---|
| **Ποιος φαίνεται ως merchant** | ΠΑΡΑΓΩΓΟΣ |
| **Statement descriptor πελάτη** | "ΜΕΛΙ ΚΡΗΤΗΣ" ή producer name |
| **Disputes/chargebacks** | Πηγαίνουν στον λογαριασμό ΠΑΡΑΓΩΓΟΥ |
| **Refunds** | Ο ΠΑΡΑΓΩΓΟΣ κάνει refund (ή DIXIS on_behalf_of) |
| **PSD2 risk** | ΧΑΜΗΛΟ — η DIXIS μόνο εισπράττει fee |
| **Ποιος κρατάει τα χρήματα** | ΠΑΡΑΓΩΓΟΣ (connected account) |
| **Stripe fees** | Χρεώνονται στον ΠΑΡΑΓΩΓΟ |

### PSD2 Πλεονεκτήματα Direct Charges:

1. **Η DIXIS δεν εισπράττει** — τα χρήματα πάνε κατευθείαν στον παραγωγό
2. **Application fee** — η Stripe αυτόματα στέλνει το fee στη DIXIS
3. **Commercial Agent**: η DIXIS εκπροσωπεί ΜΟΝΟ τον πωλητή (λαμβάνει μόνο commission)
4. **Ο πελάτης βλέπει τον παραγωγό** — direct relationship

---

## Σύγκριση Side-by-Side

| | SCT (Τρέχον) | Direct Charges (Target) |
|---|---|---|
| Χρέωση σε | Platform account DIXIS | Connected account ΠΑΡΑΓΩΓΟΥ |
| Dixis παίρνει | Transfer (total - fee) → producer | Application fee μόνο |
| Statement | "DIXIS" | Όνομα παραγωγού |
| Disputes | → DIXIS (πρόβλημα!) | → Παραγωγός |
| Refund | DIXIS refunds + reverse transfer | Παραγωγός refunds |
| PSD2 risk | HIGH | LOW |
| Stripe fees | DIXIS πληρώνει | Παραγωγός πληρώνει |
| Πολυπλοκότητα | Πιο πολύπλοκο | Πιο απλό |

---

## Multi-Producer Order: Πώς δουλεύει

### Τρέχον (SCT):
```
Checkout €150 (2 παραγωγοί)
    │
    ▼ 1 PaymentIntent €150
    │
    ├─► Transfer €66 → Producer A (€75 - €9 commission)
    └─► Transfer €66 → Producer B (€75 - €9 commission)
        Dixis κρατάει: €18 commission
```

### Target (Direct Charges):
```
Checkout €150 (2 παραγωγοί)
    │
    ├─► PaymentIntent €75 on_behalf_of Producer A
    │   application_fee: €9
    │
    └─► PaymentIntent €75 on_behalf_of Producer B
        application_fee: €9

        Dixis λαμβάνει: 2 × €9 = €18 application fees
```

**Σημείωση:** Με Direct Charges σε multi-producer checkout, χρειάζονται ΠΟΛΛΑΠΛΑ PaymentIntents (ένα ανά παραγωγό). Αυτό σημαίνει:
- Πολλαπλές χρεώσεις στην κάρτα πελάτη
- Πιο πολύπλοκο UX
- Εναλλακτική: Destination Charges (μία χρέωση, πολλαπλοί παραλήπτες)

---

## Backend Changes Required (αν αλλάξουμε σε Direct)

| File | Αλλαγή |
|---|---|
| `StripePaymentProvider.php` | Προσθήκη `on_behalf_of` + `application_fee_amount` |
| `StripeConnectService.php` | Αφαίρεση `createTransfer()` |
| `StripeWebhookController.php` | Αφαίρεση `createTransfersForOrders()` |
| `CheckoutService.php` | Split multi-producer σε πολλαπλά PaymentIntents |
| `config/payments.php` | Νέο setting: `stripe_charge_model` |

**Estimated effort:** 2-3 days backend refactor + testing

---

## Ερωτήσεις για Λογιστή/Δικηγόρο

1. **Με SCT, η DIXIS λειτουργεί ως πάροχος πληρωμών;** Χρειαζόμαστε άδεια ΤτΕ;
2. **Με Direct Charges, η DIXIS λαμβάνει μόνο application_fee.** Αυτό αλλάζει τη φορολογική μεταχείριση;
3. **Statement descriptor:** Ποιος πρέπει να φαίνεται στον πελάτη; DIXIS ή ο παραγωγός;
4. **Disputes/chargebacks:** Ποιος πρέπει να τα χειρίζεται νομικά;
5. **Stripe fees (1.5%+€0.25):** Σε ποιον χρεώνονται; Πώς καταγράφονται λογιστικά;

---

## Τρίτη Επιλογή: Destination Charges (Υβριδικό)

```
Πελάτης (Κάρτα)
    │
    ▼
┌──────────────────────────────┐
│  Stripe PaymentIntent        │
│  Charge on DIXIS account     │  ← Η χρέωση στη DIXIS
│  transfer_data:              │
│    destination: acct_xxx     │  ← Αυτόματη μεταφορά σε παραγωγό
│    amount: €88.00            │
│  (€100.00)                   │
└──────────────────────────────┘
    │
    Stripe αυτόματα:
    ├─► €88.00 → Producer (destination)
    └─► €12.00 → DIXIS (implicit fee)
```

Πλεονέκτημα: Μία χρέωση, αλλά χρήματα πάνε αυτόματα στον παραγωγό.
Μειονέκτημα: Ακόμα η DIXIS φαίνεται ως merchant (PSD2 risk μεσαίο).

---

*Η Stripe είναι αδειοδοτημένος πάροχος πληρωμών (E-Money Institution). Η DIXIS χρησιμοποιεί Stripe Connect, δεν χειρίζεται χρήματα η ίδια.*
