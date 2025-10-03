# PRD-03 — Shipping & Pricing (GR)
**Owner:** Ops/Logistics · **Status:** Draft

## Πρόβλημα {#problem}
Πολυπλοκότητα (νησιά, volumetric, αντικαταβολή, lockers).

## Απαιτήσεις {#requirements}
- Ζώνες Ελλάδας & remote/rural surcharges
- Volumetric weight & caps
- Locker incentives & free-thresholds
- Διαφάνεια κόστους στο checkout (PRD-05)

## KPIs {#kpis}
- Avg Shipping Cost/Order, Locker adoption %, Checkout conversion impact

## Acceptance (MVP) {#acceptance}
- [Rates] Ο αλγόριθμος επιστρέφει ≥1 valid rate σε 99% p50 καλαθιών test set.
- [Volumetric] Χρήση max(actual, volumetric) με σωστό rounding ανά carrier.
- [Lockers] Lockers εμφανίζονται μόνο αν zip υποστηρίζεται· fallback σε door-to-door.
- [Surcharges] Remote/rural επιβαρύνσεις εμφανίζονται ξεκάθαρα στη διάσπαση κόστους.
- [Cash on Delivery] Επιπλέον fee εμφανίζεται/υπολογίζεται σωστά.

## JSON Contracts {#contracts}
**Request** (docs/schemas/shipping_rate_request.json) και **Response** (docs/schemas/shipping_rate_response.json) καθορίζουν το rating engine I/O.
