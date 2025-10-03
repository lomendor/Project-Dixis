---
title: PRD v2 — Ιστορίες & Επικές Εργασίες
last_updated: 2025-09-30
source: "docs/prd/v2/* (PRD v2 shards) + PRD/PRD Dixis Τελικό .docx.md"
---

# Ιστορίες & Επικές Εργασίες (PRD v2)

Συνοπτικός backlog σε μορφή BMAD, προερχόμενος από τα PRD v2 shards. Οι ιστορίες συνδέονται με λειτουργικές απαιτήσεις, ροές UX και κριτήρια αποδοχής.

Σχετικά έγγραφα: [Λειτουργικές Απαιτήσεις](./02-functional-requirements.md), [UX & Ροές](./04-ux-and-flows.md), [Κριτήρια Αποδοχής](./08-acceptance-criteria.md), [Δεδομένα](./06-data-model.md).

## Επικές
- Checkout: καλάθι → διεύθυνση → αποστολή → πληρωμή → επιβεβαίωση.
- Shipping: ζώνες, βάρος, όρια δωρεάν, overrides παραγωγών.
- Payments: Stripe, PayPal, εκκαθάριση/παραστατικά.
- B2B: εγγραφή/επαλήθευση, συνδρομές, επαναλαμβανόμενες παραγγελίες.
- Εικονικές Επισκέψεις: pre-recorded και live sessions.

## Ιστορίες ανά Επική

### Checkout

1) Checkout: Ροή Ολοκλήρωσης Παραγγελίας (E2E)
- Περιγραφή: Από το καλάθι έως την επιβεβαίωση, με ελληνικά κείμενα και ορατά CTA ανά εγκυρότητα input.
- Acceptance Criteria:
  - Ολοκλήρωση ροής με επιτυχία και προβλεπόμενα βήματα (cart → address → shipping → payment → review → confirmation).
  - Κουμπιά/CTA ενεργά/ανενεργά σύμφωνα με εγκυρότητα πεδίων (βλ. Κριτήρια Αποδοχής/Checkout).
  - Επιβεβαίωση παραγγελίας με ορατό αναγνωριστικό.
  - Πηγή: [08-acceptance-criteria.md](./08-acceptance-criteria.md)
- Dependencies: Shipping υπολογισμός, Payments επιλογές.
- Labels: checkout, e2e

2) Διεύθυνση & Επιλογές Αποστολής
- Περιγραφή: Συλλογή διεύθυνσης με αυτόματο υπολογισμό διαθέσιμων μεθόδων αποστολής.
- Acceptance Criteria:
  - Εισαγωγή ΤΚ → ανάθεση ζώνης και προβολή διαθέσιμων επιλογών.
  - Επαλήθευση δυναμικής αλλαγής κόστους βάσει βάρους καλαθιού.
  - Edge cases: κενός ΤΚ/εκτός κάλυψης → φιλικό μήνυμα.
  - Πηγή: [02-functional-requirements.md §3.4.1–3.4.3](./02-functional-requirements.md), [06-02-shipping-system](./06-data-model/06-02-shipping-system.md)
- Dependencies: Shipping ζώνες/αλγόριθμος.
- Labels: checkout, shipping

3) Επιλογή Πληρωμής & Επιβεβαίωση
- Περιγραφή: Επιλογή Stripe/PayPal/άλλων και έκδοση παραστατικών + email επιβεβαίωσης.
- Acceptance Criteria:
  - Επιτυχής πληρωμή με Stripe ΚΑΙ PayPal σε sandbox.
  - Δημιουργία παραστατικών και αποστολή email.
  - Ορθή επιστροφή/redirect σε σελίδα επιβεβαίωσης.
  - Πηγή: [02-functional-requirements.md §3.4.2](./02-functional-requirements.md), [08-acceptance-criteria.md/Πληρωμές](./08-acceptance-criteria.md)
- Dependencies: Payments integrations.
- Labels: checkout, payments, e2e

### Shipping

4) Υπολογισμός Μεταφορικών ανά Ζώνη/Βάρος
- Περιγραφή: Αλγόριθμος κοστολόγησης με ζώνες (αστικές/ηπειρωτικές/νησιά/δυσπρόσιτες) και κλίμακες βάρους.
- Acceptance Criteria:
  - ΤΚ → σωστή χαρτογράφηση ζώνης.
  - Κλίμακα βάρους → σωστή χρέωση.
  - Υπολογισμός επιπλέον κιλών όταν υπερβαίνεται όριο.
  - Πηγή: [06-02-shipping-system.md](./06-data-model/06-02-shipping-system.md), [02-functional-requirements.md §3.4.3](./02-functional-requirements.md)
- Dependencies: Δεδομένα ζωνών/tiers.
- Labels: shipping

5) Overrides Παραγωγού & Ευπαθή Προϊόντα
- Περιγραφή: Ανά παραγωγό ειδικές χρεώσεις/μέθοδοι και κανόνες για ευπαθή προϊόντα.
- Acceptance Criteria:
  - Override τιμών/μεθόδων ανά παραγωγό εφαρμόζεται στον τελικό υπολογισμό.
  - Flag ευπαθών → ειδικοί όροι/περιορισμοί μεθόδων.
  - Πηγή: [06-02-shipping-system.md/Αλγόριθμος](./06-data-model/06-02-shipping-system.md)
- Dependencies: Μοντέλο δεδομένων παραγωγών/προϊόντων.
- Labels: shipping

6) Όριο Δωρεάν Μεταφορικών
- Περιγραφή: Υποστήριξη ορίου καλαθιού που μηδενίζει μεταφορικά.
- Acceptance Criteria:
  - Όταν subtotal ≥ threshold → 0€ μεταφορικά.
  - Συνδυασμός με overrides/ζώνες δεν παράγει αρνητικές τιμές.
  - Πηγή: [02-functional-requirements.md §3.4.3](./02-functional-requirements.md)
- Dependencies: Υπολογισμός συνόλου καλαθιού.
- Labels: shipping

### Payments

7) Stripe: Βασική Ενσωμάτωση Checkout
- Περιγραφή: Πληρωμή με Stripe Elements/Redirect σε δοκιμαστικό περιβάλλον.
- Acceptance Criteria:
  - Επιτυχής χρέωση test cards, αποτύπωση status παραγγελίας.
  - Διαχείριση σφαλμάτων/ακυρώσεων με κατάλληλα μηνύματα.
  - Πηγή: [02-functional-requirements.md §3.4.2](./02-functional-requirements.md)
- Dependencies: Checkout ροή, παραγγελίες.
- Labels: payments, checkout

8) PayPal: Βασική Ενσωμάτωση
- Περιγραφή: Πληρωμή μέσω PayPal sandbox με επιστροφή σε confirmation.
- Acceptance Criteria:
  - Επιτυχής συναλλαγή sandbox, ενημέρωση παραγγελίας.
  - Αποτυχία/ακύρωση → εύρηστα fallback/μηνύματα.
  - Πηγή: [02-functional-requirements.md §3.4.2](./02-functional-requirements.md)
- Dependencies: Checkout ροή.
- Labels: payments

9) Εκκαθάριση & Statements Παραγωγών
- Περιγραφή: Καταγραφή εκκαθαρίσεων και παραγωγή statements/τιμολόγησης.
- Acceptance Criteria:
  - Δημιουργία statement ανά παραγωγό μετά από επιτυχή πληρωμή.
  - Διαθεσιμότητα αρχείου/αναφοράς για λογιστική.
  - Πηγή: [02-functional-requirements.md §3.4.2](./02-functional-requirements.md)
- Dependencies: Orders, Payments records.
- Labels: payments, accounting

### B2B

10) Εγγραφή & Επαλήθευση Επιχείρησης
- Περιγραφή: Onboarding επιχείρησης με στοιχεία (ΑΦΜ/ΔΟΥ) και έγκριση.
- Acceptance Criteria:
  - Έγκυρα πεδία, αποθήκευση, κατάσταση "υπό έγκριση"/"ενεργή".
  - Προφίλ επιχείρησης με βασικά στοιχεία διαθέσιμο.
  - Πηγή: [01-personas-and-use-cases.md](./01-personas-and-use-cases.md)
- Dependencies: Auth, μοντέλο Business.
- Labels: b2b, onboarding

11) Συνδρομές B2B (Basic/Pro/Premium)
- Περιγραφή: Συνδρομητικά πλάνα με προμήθειες και οφέλη (0% προμήθεια στο Premium).
- Acceptance Criteria:
  - Δημιουργία/ενεργοποίηση συνδρομής, κύκλος χρέωσης.
  - Commission rate εφαρμοσμένο ανά πλάνο.
  - Πηγή: [02-functional-requirements.md §3.5](./02-functional-requirements.md), [06-03-b2b-subscriptions.md](./06-data-model/06-03-b2b-subscriptions.md)
- Dependencies: Payments, accounts.
- Labels: b2b, subscriptions

### Εικονικές Επισκέψεις

12) Pre-recorded Virtual Tours
- Περιγραφή: Καταχώριση/προβολή περιηγήσεων (YouTube/Vimeo/upload) με metadata.
- Acceptance Criteria:
  - Δημιουργία εγγραφής tour με τίτλο/περιγραφή/thumbnail/video_url.
  - Συσχέτιση με προϊόντα/παραγωγό (όπου προβλέπεται).
  - Πηγή: [02-functional-requirements.md §3.6](./02-functional-requirements.md), [06-04-virtual-tours.md](./06-data-model/06-04-virtual-tours.md)
- Dependencies: Media hosting, παραγωγοί/προϊόντα.
- Labels: virtual-tours, content

13) Live Sessions & Registrations
- Περιγραφή: Προγραμματισμός ζωντανών συνεδριών, συμμετέχοντες, τιμολόγηση premium.
- Acceptance Criteria:
  - Δημιουργία session με τύπο, ημερομηνία, μέγιστους συμμετέχοντες.
  - Εγγραφές/πληρωμές όπου απαιτείται, αποθήκευση recording_url.
  - Πηγή: [02-functional-requirements.md §3.6](./02-functional-requirements.md), [06-04-virtual-tours.md](./06-data-model/06-04-virtual-tours.md)
- Dependencies: Payments, notifications (email).
- Labels: virtual-tours, events

## Acceptance Hints
- Αναφορά στα [Κριτήρια Αποδοχής](./08-acceptance-criteria.md) για Checkout/Shipping/Πληρωμές.
- Χρησιμοποιήστε τις ροές από το [UX & Ροές](./04-ux-and-flows.md) για τα βήματα.
- Ευθυγράμμιση με το [Μοντέλο Δεδομένων](./06-data-model.md) για οντότητες/σχέσεις.

## Εκκρεμότητες / Ρίσκα (από PRD v2)
- Διασφάλιση συμβατότητας με sandbox πληρωμών και διαχείριση αποτυχιών.
- Πληρότητα δεδομένων ζωνών/κλιμάκων και κανόνων παραγωγών.
- Κλιμάκωση media (thumbnails, recordings) για εικονικές επισκέψεις.

---
Σημείωση: Το αρχείο αυτό συγκεντρώνει ιστορίες μόνο από PRD v2 shards και τις αναφερόμενες ενότητες του PRD (markdown εξαγωγή).

