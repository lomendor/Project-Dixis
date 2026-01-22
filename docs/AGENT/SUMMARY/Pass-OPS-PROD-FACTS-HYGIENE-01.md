# Pass OPS-PROD-FACTS-HYGIENE-01: Prod Facts Output Hygiene

**Date**: 2026-01-22T14:35:00Z
**Commit**: TBD (pending merge)
**Pass ID**: OPS-PROD-FACTS-HYGIENE-01

---

## TL;DR

Stopped `docs/OPS/PROD-FACTS-LAST.md` from dirtying the git working tree on every run. Output now goes to gitignored `.local/` folder.

---

## Problem

Every time `scripts/prod-facts.sh` ran (manually or in CI), it would modify `docs/OPS/PROD-FACTS-LAST.md`, causing:
- Dirty working tree after fresh clone + script run
- Unnecessary noise in `git status`
- Potential for accidental commits of auto-generated content

## Solution

1. **Redirect output** to `docs/OPS/.local/PROD-FACTS-LAST.md` (untracked)
2. **Add gitignore rule** for `docs/OPS/.local/` and `docs/OPS/PROD-FACTS-LAST.md`
3. **Remove tracked file** via `git rm --cached`
4. **Create placeholder** `docs/OPS/PROD-FACTS-LAST.example.md` with usage instructions

---

## Changes Made

| File | Change |
|------|--------|
| `scripts/prod-facts.sh` | Output to `.local/` instead of tracked file |
| `.gitignore` | Add rules for `.local/` and legacy file |
| `docs/OPS/PROD-FACTS-LAST.md` | Removed from tracking (git rm --cached) |
| `docs/OPS/PROD-FACTS-LAST.example.md` | NEW - stable placeholder with usage docs |

---

## Reproduction & Proof

### Before Fix
```bash
git checkout -f main
git status --porcelain  # clean
bash scripts/prod-facts.sh
git status --porcelain  # M docs/OPS/PROD-FACTS-LAST.md  <-- DIRTY
```

### After Fix
```bash
git checkout -f main
git status --porcelain  # clean
bash scripts/prod-facts.sh
git status --porcelain  # (empty)  <-- CLEAN
ls docs/OPS/.local/     # PROD-FACTS-LAST.md exists (untracked)
```

---

## Verification

1. Fresh clone + script run = clean working tree
2. Output still accessible at `docs/OPS/.local/PROD-FACTS-LAST.md`
3. No workflow files changed
4. Lint passes (existing warnings only)

---

## Artifacts

- Script: `scripts/prod-facts.sh` (updated)
- Placeholder: `docs/OPS/PROD-FACTS-LAST.example.md`
- Gitignore: `.gitignore` (updated)

---

**Working Tree Hygiene: FIXED**
