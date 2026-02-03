# Production Deploy SOP

**Last Updated**: 2026-02-03 (Pass-PROD-OPS-GUARDRAILS-01)

> **Canonical script**: `scripts/prod-deploy-clean.sh`
> **Supersedes**: `docs/OPS/DEPLOY-FRONTEND.md` (legacy, kept for history)

---

## Golden Path

### From local machine (SSH mode)

```bash
bash scripts/prod-deploy-clean.sh
```

The script SSHs into the VPS (host alias `dixis-prod`) and runs the full sequence.

### Directly on VPS

```bash
SSH_ONLY=1 bash scripts/prod-deploy-clean.sh
```

### What the script does (in order)

| Step | Action | Failure behavior |
|------|--------|------------------|
| Preflight | Verify prod is live (`/api/healthz`, `/`) | STOP if unhealthy |
| A | `git reset --hard origin/main` | STOP on error |
| B | Guardrails: drift, deleted files, ghost deps, config drift | STOP with fix instructions |
| C | Wipe `node_modules` + `.next` | Always clean slate |
| D | `pnpm install --frozen-lockfile` | STOP on error |
| E | `pnpm rebuild` (native modules) | STOP on error |
| F | Post-install sanity (no ghost `@types/sharp`) | STOP if found |
| G | `prisma generate` + `pnpm build` | STOP on error, prints log tail |
| H | Copy standalone assets | Continues |
| I | `pm2 restart` (only after successful build) | STOP on error |
| J | Localhost verification (4 endpoints) | WARN only |
| Postflight | Public HTTPS verification (4 endpoints) | STOP if unhealthy |

---

## Environment Variables

Override defaults via env vars:

| Variable | Default | Purpose |
|----------|---------|---------|
| `DEPLOY_REMOTE` | `dixis-prod` | SSH host alias |
| `DEPLOY_ROOT` | `/var/www/dixis/current` | Repo root on VPS |
| `DEPLOY_PM2_APP` | `dixis-frontend` | PM2 app name |
| `DEPLOY_NODE_HEAP` | `2048` | Node.js max heap (MB) |
| `DEPLOY_PROD_URL` | `https://dixis.gr` | Public URL for health checks |

---

## Common Failure Modes

### 1. Tracked files missing from disk

**Symptom**: `git ls-files --deleted` shows files after reset.

**Root cause**: `git checkout -f HEAD` does NOT restore all deleted tracked files.

**Fix**: Always use `git reset --hard origin/main` (the script does this).

### 2. Ghost `@types/sharp` in node_modules

**Symptom**: TS build error `Cannot find type definition file for 'sharp'`.

**Root cause**: `@types/sharp@0.32.0` was manually installed during debugging but not in `package.json`. Stale `node_modules` kept it alive.

**Fix**: The script wipes `node_modules` entirely before install. It also checks for this ghost package before and after install.

### 3. pnpm build scripts not running (sharp/prisma/esbuild)

**Symptom**: Native modules fail at runtime (`sharp`, `prisma`, `esbuild`).

**Root cause**: pnpm's `onlyBuiltDependencies` can block native module compilation.

**Fix**: Script runs `pnpm config set onlyBuiltDependencies "[]"` before install, then `pnpm rebuild` after.

### 4. OOM during Next.js build

**Symptom**: `FATAL ERROR: Reached heap limit Allocation failed`.

**Root cause**: Default Node.js heap (320MB) too small for TS type-checking.

**Fix**: Script sets `NODE_OPTIONS='--max-old-space-size=2048'`.

### 5. VPS config drift (`ignoreBuildErrors`)

**Symptom**: Build succeeds but masks real TS errors. Breaks on next clean deploy.

**Root cause**: Manual edit to `next.config.ts` on VPS during emergency.

**Fix**: Script checks for `ignoreBuildErrors` in `next.config.ts` and STOPs if found. The proper fix is the `sharp.d.ts` shim (PR #2605).

---

## Rules

1. **No manual edits on VPS**. All code changes go through PRs.
2. **Never use `ignoreBuildErrors`**. Fix TS errors properly (shims, type fixes).
3. **Always `git reset --hard`**, never `git checkout -f`.
4. **Always wipe `node_modules`** for deterministic installs.
5. **PM2 restart only after successful build**. Never restart on a failed build.

---

## Verification Endpoints

### Localhost (on VPS)

```bash
curl -s http://127.0.0.1:3000/api/healthz
curl -s http://127.0.0.1:3000/
curl -s http://127.0.0.1:3000/og-products.jpg
curl -s http://127.0.0.1:3000/twitter-products.jpg
```

### Public HTTPS

```bash
curl -s https://dixis.gr/api/healthz
curl -s https://dixis.gr/
curl -s https://dixis.gr/og-products.jpg
curl -s https://dixis.gr/twitter-products.jpg
```

---

## Build Log

On failure, the script captures build output to `/tmp/dixis-deploy.log` and prints the last 80 lines. Check this file for detailed error context.

---

## Incident History

| Date | Issue | Root Cause | Fix |
|------|-------|------------|-----|
| 2026-02-02 | OG images 404 | Missing assets in `public/` | PR #2594 |
| 2026-02-02 | Build fails on VPS | Ghost `@types/sharp`, stale node_modules | PR #2605 (sharp shim) |
| 2026-02-02 | 143 tracked files missing | `git checkout -f` vs `git reset --hard` | SOP mandates `reset --hard` |
| 2026-02-03 | SOP codified | Manual deploy steps error-prone | PR #2606 (this script) |
