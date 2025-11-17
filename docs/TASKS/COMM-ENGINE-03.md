# COMM-ENGINE-03 — Rule Resolution (feature-flagged)
Scope:
- Συνδέουμε CommissionService με commission_rules (producer > category > channel > default)
- Τήρηση tier_min/max, VAT mode (INCLUDE/EXCLUDE/NONE), rounding (UP/DOWN/NEAREST), effective dates, active
Safety:
- Πίσω από το flag `commission_engine_v1` (OFF by default)
- Καμία σύνδεση με order totals (αυτό είναι το COMM-ENGINE-04)
Acceptance:
- Unit tests για precedence, tiers, VAT/rounding, effective dates, active
- 0 παρενέργειες στο checkout με flag OFF
