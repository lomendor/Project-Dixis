---
title: PRD v2 — Import Notes
last_updated: 2025-09-29
source: "N/A (operational notes)"
---

# Import Notes (PRD → v2 Shards)

Πηγή
- Αναμενόμενο κύριο αρχείο: `prd/PRD-Dixis-Τελικό.md` (ή παρεμφερές όνομα).
- Εναλλακτικά/συμπληρωματικά: `prd/PRD Dixis Τελικό .docx` (ή παρεμφερές).
- Τρέχον repository: δεν περιέχει φάκελο `prd/` — προσθέστε τα αρχεία-πηγή και ακολουθήστε τα παρακάτω βήματα.

Εξαγωγή από .docx (εφόσον υπάρχει pandoc)
```bash
pandoc "prd/PRD Dixis Τελικό .docx" -t gfm -o /tmp/prd.md
```

Εισαγωγή από .md (κύρια)
```bash
# Υποθέτουμε κύρια πηγή: prd/PRD-Dixis-Τελικό.md
SRC="prd/PRD-Dixis-Τελικό.md"
# Επιβεβαίωση ελληνικών τίτλων (H1/H2) και χαρτογράφηση σε shards
```

Χαρτογράφηση (ενδεικτική)
- 00-overview.md → Εισαγωγή/Στόχοι/Πεδίο
- 01-personas-and-use-cases.md → Personas/Use Cases
- 02-functional-requirements.md → Λειτουργικές απαιτήσεις (ομαδοποιημένες υποενότητες)
- 03-non-functional-requirements.md → Απόδοση/Ασφάλεια/SLA/i18n
- 04-ux-and-flows.md → Ροές/Σκίτσα/Πλοήγηση
- 05-architecture.md → Υψηλού επιπέδου/Context/Υποσυστήματα
- 06-data-model.md → ERD/Οντότητες/Κλειδιά
- 07-ci-cd-and-quality.md → Στρατηγική QA/CI/CD
- 08-acceptance-criteria.md → Κριτήρια ανά epic/feature
- 09-appendices.md → Υπόλοιπο υλικό

Εικόνες/Σχήματα
- Εξάγετε σε `docs/prd/assets/` και αναφέρετε εικόνες με σχετικούς συνδέσμους.

Κανόνες
- Κάθε shard ≤ ~300 γραμμές. Αν ξεπερνά: δημιουργήστε υποφάκελο (02-functional-requirements/*) και σπάστε σε 02-01-*.md κ.ο.κ.
- Front-matter σε κάθε αρχείο:
  - `title`, `last_updated`, `source: "prd/<αρχείο-πηγή>"`
- Μόνο docs/** τροποποιούνται (καμία αλλαγή σε runtime/workflows).

TODOs για εισαγωγή (μετά την προσθήκη του PRD στο `prd/`)
- Επαναγράψτε `last_updated` σε κάθε shard με σημερινή ημερομηνία.
- Συμπληρώστε `source` με ακριβές μονοπάτι.
- Ενημερώστε `index.md` και `SUMMARY.md` για νέες υποενότητες αν προκύψουν.

