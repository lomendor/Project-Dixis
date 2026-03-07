# DAC7/DSA Field Audit — Producer Onboarding

**Date:** March 2026
**Purpose:** Gap analysis — what fields exist vs what's required by DAC7 & DSA
**Codebase verified:** All fields checked against migrations, models, and frontend forms

---

## Quick Summary

| Regulation | Required Fields | Exist | Required in Form | Missing |
|---|---|---|---|---|
| DAC7 | 8 fields | 5 | 3 | 3 |
| DSA Art. 30 | 7 fields | 5 | 3 | 2 |
| **Combined unique** | **11 fields** | **7** | **4** | **4** |

---

## DAC7 (Ν. 5047/2023) — Mandatory Seller Reporting to AADE

Η Dixis ως marketplace πρέπει να αναφέρει ετησίως τα έσοδα πωλητών στην ΑΑΔΕ (XML).

### Field-by-Field Audit

| # | DAC7 Field | DB Column | Validation | Frontend | Status |
|---|---|---|---|---|---|
| 1 | **Full legal name** | `business_name` | nullable, string | Optional text field | PARTIAL — exists but NOT required |
| 2 | **Primary address** | `address` + `city` + `postal_code` + `region` | All nullable | Required in onboarding form | PARTIAL — DB optional, frontend required |
| 3 | **Tax ID (AFM/TIN)** | `tax_id` | nullable, regex `^\d{9}$` | Required in onboarding form | PARTIAL — DB optional, frontend required |
| 4 | **VAT number** | — | — | — | **MISSING** — no separate VAT field |
| 5 | **Date of birth** | — | — | — | **MISSING** — not collected at all |
| 6 | **Bank account (IBAN)** | `iban` | nullable, EU IBAN regex | Required in onboarding form | PARTIAL — DB optional, frontend required |
| 7 | **Business registration (GEMI)** | — | — | — | **MISSING** — no field exists |
| 8 | **EU member state** | Implied from address | — | No explicit country field | PARTIAL — Greece assumed |

### DAC7 Verdict

**4 GAPS to fix before first annual report:**

1. **`vat_number`** — Separate from AFM. Some businesses have both.
2. **`date_of_birth`** — Required for natural persons (individual producers).
3. **`gemi_number`** — Greek Business Registry (GEMI) number.
4. **`country`** — Explicit EU member state field (even if always GR for now).

**Also needed:** Make `business_name`, `tax_id`, `address`, `city`, `postal_code` REQUIRED in backend validation (not just frontend).

---

## DSA Article 30 — Trader Traceability (Compliance Obligation)

Η Dixis ΔΕΝ ΜΠΟΡΕΙ να δημοσιεύσει listing χωρίς complete trader identity. Αυτό είναι κανονιστική υποχρέωση, όχι nice-to-have.

### Field-by-Field Audit

| # | DSA Art. 30 Field | DB Column | Validation | Frontend | Status |
|---|---|---|---|---|---|
| 1 | **Name** | `name` + `business_name` | `name` required | Required | OK |
| 2 | **Address** | `address` + `city` + `postal_code` | All nullable | Required in form | PARTIAL |
| 3 | **Email** | `email` | nullable, email format | Required in form | PARTIAL |
| 4 | **Phone** | `phone` | nullable, max 20 chars | Required in form | PARTIAL |
| 5 | **ID document copy** | — | — | — | **MISSING** |
| 6 | **Bank account** | `iban` + `bank_account_holder` | nullable | Required in form | PARTIAL |
| 7 | **Trade register (GEMI)** | — | — | — | **MISSING** |

### DSA Verdict

**2 GAPS to fix before allowing listings:**

1. **`id_document_url`** — Upload field for ID/passport scan. Required by DSA.
2. **`gemi_number`** — Trade register number (same as DAC7 gap).

**Also needed:** Self-certification checkbox specifically for DSA compliance (currently only generic "Producer Agreement").

---

## Combined Action Plan

### Ζήτα λογιστή/δικηγόρο:

1. **DAC7: Πότε αρχίζει η υποχρέωση;** Με τον πρώτο πωλητή ή με κάποιο threshold;
2. **DAC7: Τι ακριβώς πεδία χρειαζόμαστε Day 1;** Πρέπει να τα έχουμε ΠΡΙΝ δεχτούμε παραγωγούς;
3. **DSA Art. 30: Μπορούμε να δημοσιεύσουμε listings χωρίς complete trader info;**
4. **ΑΦΜ vs ΦΠΑ:** Οι μικροπαραγωγοί (<10K) δεν έχουν ΦΠΑ — τι βάζουμε;
5. **GEMI:** Όλοι οι παραγωγοί έχουν GEMI; Ατομικές επιχειρήσεις;

### Backend changes needed (ΜΕΤΑ τη λογιστική επιβεβαίωση):

| Change | Effort | Priority |
|---|---|---|
| Add `date_of_birth` field + migration | S | DAC7 |
| Add `gemi_number` field + migration | S | DAC7 + DSA |
| Add `vat_number` field + migration | S | DAC7 |
| Add `country` field (default 'GR') + migration | S | DAC7 |
| Add `id_document_url` upload field + migration | M | DSA |
| Add DSA compliance checkbox + migration | S | DSA |
| Make address/tax_id/email/phone REQUIRED in backend | S | Both |
| Build DAC7 XML export (annual report) | L | DAC7 |

---

## Current Onboarding Flow (What Producer Sees)

```
Step 1: Βασικά Στοιχεία
├── Επωνυμία (name) ← REQUIRED
├── Περιγραφή (description)
├── ΑΦΜ (tax_id) ← REQUIRED in form
├── ΔΟΥ (tax_office)
├── Τηλέφωνο (phone) ← REQUIRED in form
└── Email (email) ← REQUIRED in form

Step 2: Διεύθυνση
├── Οδός (address) ← REQUIRED in form
├── Πόλη (city) ← REQUIRED in form
├── Τ.Κ. (postal_code) ← REQUIRED in form
└── Περιφέρεια (region) ← dropdown, 13 regions

Step 3: Τραπεζικά
├── IBAN ← REQUIRED in form
└── Δικαιούχος (bank_account_holder) ← REQUIRED in form

Step 4: Κατηγορίες Προϊόντων
└── Multi-select categories

Step 5: Έγγραφα
├── Εκτύπωση TAXIS (tax_registration_doc_url) ← REQUIRED
├── Γνωστοποίηση ΕΦΕΤ (efet_notification_doc_url) ← REQUIRED
├── HACCP (haccp_declaration_doc_url) ← Optional
├── Μελισσοκομικό Μητρώο ← IF honey category
├── CPNP Notification ← IF cosmetics category
└── Responsible Person ← IF cosmetics category

Step 6: Αποδοχή Όρων
└── Producer Agreement ← REQUIRED
```

### What's MISSING from this flow:

```
❌ Ημερομηνία γέννησης (date_of_birth) — DAC7
❌ Αριθμός ΓΕΜΗ (gemi_number) — DAC7 + DSA
❌ Αρ. Μητρώου ΦΠΑ (vat_number) — DAC7
❌ Αντίγραφο ταυτότητας (id_document_url) — DSA
❌ DSA compliance checkbox — DSA
❌ Χώρα (country) — DAC7 (assumed GR)
```

---

## Παρατήρηση: Frontend vs Backend Mismatch

**Σημαντικό:** Πολλά πεδία είναι `REQUIRED` στο frontend form αλλά `nullable` στο backend validation. Αυτό σημαίνει:

1. Κάποιος μπορεί να κάνει POST στο API χωρίς αυτά τα πεδία
2. Αν κάτι πάει στραβά στο frontend, ο backend δεν προστατεύει
3. Existing producers (π.χ. test data, seeds) μπορεί να μην έχουν τα πεδία

**Fix:** Κάνε τα DAC7/DSA mandatory πεδία REQUIRED και στο `StoreProducerRequest.php` / `UpdateProducerRequest.php`.

---

*Audit based on actual codebase review. All file paths verified. March 2026.*
