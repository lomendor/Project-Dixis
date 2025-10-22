# Branch Protection — Require only **Gate (required)**

Στόχος: Να απλοποιήσουμε τα required checks ώστε το PR να απαιτεί **ένα** μόνο check: **Gate (required)**.
Το job αυτό εξαρτάται από όλα τα υπόλοιπα jobs και αποτυγχάνει μόνο αν κάποιο απέτυχε (τα *skipped* είναι ΟΚ για fast paths).

## Βήματα (GitHub UI)
1. Repo → **Settings** → **Branches** → **Branch protection rules**.
2. Επίλεξε τον κανόνα για το `main` (ή **Add rule**).
3. Ενεργοποίησε **Require status checks to pass before merging**.
4. Στο πεδίο **Status checks**, επίλεξε **Gate (required)** και **ΑΦΑΙΡΕΣΕ** τα υπόλοιπα επιμέρους (QA, Smoke κ.λπ.).
5. Αν θέλεις, κράτησε **Require branches to be up to date** (προαιρετικό).
6. **Save**.

> Σημείωση: Θέλει admin δικαιώματα στο repo.

## Γιατί;
- Ένα μόνο required check → καθαρή εικόνα.
- Συμβατό με **ui-only/ops-only fast paths** (τα skips δεν μπλοκάρουν).
- Αν κάτι σπάσει, το Gate θα γίνει **κόκκινο** και θα δείξει ποιο job απέτυχε.

## Έλεγχος μετά τη ρύθμιση
- Άνοιξε ένα μικρό PR (π.χ. docs-only). Δες ότι τα παλιά required checks **δεν** εμφανίζονται, μόνο το **Gate (required)**.
- Το merge γίνεται όταν το Gate γίνει **πράσινο**.
