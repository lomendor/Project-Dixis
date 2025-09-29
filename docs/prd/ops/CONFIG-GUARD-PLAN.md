---
title: PRD — CONFIG GUARD PLAN
last_updated: 2025-09-30
---

# CONFIG-GUARD PLAN (Ports/Env/Flags)

TL;DR: Στοχεύουμε να διασφαλίσουμε ότι οι ρυθμίσεις περιβάλλοντος και οι θύρες είναι συνεπείς και ελεγμένες σε όλο το repo, χωρίς αιφνίδιες αλλαγές που σπάνε CI/E2E.

- Canonical Ports: Frontend 3030 (CI) / 3001 (local), API 8001.
- Canonical Env: `NEXT_PUBLIC_SITE_URL` (αποσύρεται `NEXT_PUBLIC_APP_URL`).
- Μη εισάγετε νέα flags αυθαίρετα· χρησιμοποιήστε υπάρχοντα.
- Αρμοδιότητες: τεκμηρίωση, ανίχνευση αποκλίσεων, προτάσεις διόρθωσης.

Σχετικό PR: https://github.com/lomendor/Project-Dixis/pull/237

Σημειώσεις
- Το παρόν αρχείο είναι stub για ευθυγράμμιση συνδέσμων στο PRD v2.
- Η πλήρης διαδικασία/automations μπορούν να τεκμηριωθούν εδώ σε επόμενη φάση.

