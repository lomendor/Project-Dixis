# PROD FACTS - Example Output

This is a **tracked placeholder**. The actual output is written to:

```
docs/OPS/.local/PROD-FACTS-LAST.md  (untracked)
```

## How to Run

```bash
# Generate fresh prod facts (output goes to .local/)
bash scripts/prod-facts.sh

# View the output
cat docs/OPS/.local/PROD-FACTS-LAST.md
```

## Sample Output

Below is an example of what the script produces:

---

**Last Updated**: 2026-01-22 14:00:00 UTC
**Status**: ALL SYSTEMS OPERATIONAL

| Endpoint | Status | Details |
|----------|--------|---------|
| Backend Health | 200 | `/api/healthz` returns OK |
| Products API | 200 | `/api/v1/public/products` returns data |
| Products List | 200 | `/products` displays products |
| Product Detail | 200 | `/products/1` shows content |
| Login Page | 200 | `/login` accessible |

---

## For Committed Evidence

If you need to commit prod facts as evidence for a pass:

1. Run `bash scripts/prod-facts.sh`
2. Copy relevant output to `docs/AGENT/SUMMARY/Pass-<ID>.md`
3. Commit the summary doc (not the `.local/` output)

---

**Note**: The `.local/` directory is gitignored to prevent working tree pollution.
