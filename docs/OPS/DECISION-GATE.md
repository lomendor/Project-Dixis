# Decision Gate (Stop Cycles)

## Rule 0 — Rehydrate first (60 seconds)
Before any new work:
1) Read: docs/OPS/STATE.md + docs/AGENT-STATE.md + docs/PRODUCT/PRD-INDEX.md (or PRD index file used)
2) Run: ./scripts/prod-facts.sh (or the standard curl set)
3) Decide: 1 WIP only.

## Rule 1 — CLOSED/STABLE is sacred
If a topic is in CLOSED/STABLE, do not touch it unless you produce new failing evidence (logs/curls/tests).

## Rule 2 — Definition of Done before changes
Write the measurable DoD (2–5 checks) first.

## Rule 3 — One pass = one deliverable
Audit → Decision → Fix → Proof → Update STATE → STOP.
