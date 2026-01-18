# PASSES — Unified Pass Documentation

All pass documentation lives here. Single location, no more hunting.

## File Naming Convention

| Prefix | Purpose |
|--------|---------|
| `TASK-Pass-*.md` | Detailed task specs, requirements, implementation notes |
| `SUMMARY-Pass-*.md` | Brief completion summaries, outcomes, evidence |

## Finding Pass Docs

**By pass ID:**
```bash
ls docs/AGENT/PASSES/*{PASS-ID}*
```

**Latest passes (by git commit):**
```bash
git log --oneline --name-only docs/AGENT/PASSES/ | head -30
```

**All summaries:**
```bash
ls docs/AGENT/PASSES/SUMMARY-*
```

## Creating New Pass Docs

1. **Summary** (required): `SUMMARY-Pass-{PASS-ID}.md`
2. **Task spec** (optional): `TASK-Pass-{PASS-ID}.md`

See `docs/AGENT/PASSES/TASK-Pass-000-Template.md` for task template.
