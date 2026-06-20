# Documentation Rules

Applies when creating or editing files in `docs/`.

## Navigation
- **Always check `docs/INDEX.md` first** — it lists which docs are live vs historical.
- Only ~14 docs are actively maintained. The other ~1,100 are historical archives.
- **Single source of truth**: `docs/AGENT-STATE.md`. On ANY conflict between docs, AGENT-STATE wins; CONTEXT-BOOT / OPS / SOPs defer to it. Update AGENT-STATE in the same PR as the change.
- **Volatile status claims** (deploy WORKING/BROKEN, feature flags ON/OFF, version pins) must carry a verification date AND the command used, e.g. `(verified 2026-06-20 via gh run list)`. A bare date with no command is untrusted — re-verify against reality before relying on it.

## Rules
1. **Never create a new doc** if a relevant one already exists — UPDATE the existing one.
2. **Search first** (grep/find) before creating any new file.
3. New questions for lawyer/accountant/EFET -> `docs/ACCOUNTANT-BRIEFING-GR.md` (accountant/tax) or `docs/LEGAL-LIABILITY-FOOD-MARKETPLACE.md` (lawyer/EFET)
4. New strategic decisions -> `docs/AGENT-STATE.md` (source of truth) + context in `docs/BUSINESS-REVIEW-2026-02.md`
5. New technical decisions -> `docs/AGENT-STATE.md` (WIP section)
6. New research -> `docs/research/` (ONE file per topic, update don't create new)

## Historical Folders (READ-ONLY, do NOT update)
- `docs/AGENT/PASSES/` — ~200 archived pass files
- `docs/reports/` — ~330 generated reports
- `docs/ARCHIVE/` — ~50 archived docs
- `docs/prd/` — ~36 old product requirements
