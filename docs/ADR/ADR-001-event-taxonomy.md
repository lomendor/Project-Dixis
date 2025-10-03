# ADR-001 — Event Taxonomy
## Απόφαση
Χρησιμοποιούμε ονοματοδοσία `dixis.<domain>.<action>[.<result>]` (π.χ., `dixis.checkout.started`, `dixis.checkout.completed.success`).
## Λόγοι
Σταθερή τηλεμετρία, queries, alerts.
## Συνέπειες
Προσθήκη event id σε κάθε κρίσιμη ροή (PRD-05/10).
