# Agent Docs (Dixis)

> **Start here**: `docs/ACTIVE.md` — THE entry point for every session.

## Boot Sequence (3 files)

1. `docs/ACTIVE.md` — WIP, NEXT, blockers, quick facts
2. `docs/AGENT/SEEDS/boot.md` — Constraints, working style
3. `docs/OPS/STATE.md` — Recent history (last 30 days)

## Δομή

| Folder | Purpose |
|--------|---------|
| SYSTEM/ | Architecture, routes, DB schema, APIs |
| SOPs/ | Standard operating procedures |
| TASKS/ | Task definitions per pass |
| SUMMARY/ | TL;DR per pass (≤2000 tokens) |
| SEEDS/ | Boot prompts, templates |

## After Each Pass

1. Update `docs/ACTIVE.md` (WIP → done, pull next)
2. Update `docs/OPS/STATE.md` (add entry at top)
3. Create `TASKS/Pass-{NAME}.md`
4. Create `SUMMARY/Pass-{NAME}.md`
