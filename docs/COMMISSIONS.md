# Dixis Commission Engine v1 (flagged, isolated)
- Rules per line item (producer/category/channel/tiers), flag: `commission_engine_v1` (default OFF).
- No checkout impact yet. Next: integrate into order totals once stable.

**Rule priority:** producer > category > channel > default  
**Fields:** percent, fixed_fee_cents, tiers (min/max), vat_mode(INCLUDE/EXCLUDE/NONE), rounding(UP/DOWN/NEAREST), effective_from/to, priority.

**Notes:** Avoid PG ENUM for now; no heavy FKs; VAT % to move to TAX-01 pass.
