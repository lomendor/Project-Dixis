# AG111 — CODEMAP

## Modified File

### .github/workflows/migration-clinic.yml
Fixed Migration Clinic workflow to run from frontend directory with proper pnpm cache.

**Key Changes**:

1. **Added defaults section** (lines 17-19):
   ```yaml
   defaults:
     run:
       working-directory: frontend
   ```
   - All `run` steps now execute from `frontend/` directory
   - Fixes issue where Prisma commands couldn't find schema

2. **Fixed pnpm cache path** (line 43):
   ```yaml
   cache-dependency-path: frontend/pnpm-lock.yaml
   ```
   - Previously: looked for `pnpm-lock.yaml` in repo root (doesn't exist)
   - Now: correctly points to `frontend/pnpm-lock.yaml`
   - Enables proper caching for faster runs

3. **Added PNPM version check** (lines 48-49):
   ```yaml
   - name: PNPM version
     run: pnpm -v
   ```
   - Debugging step to verify pnpm is available
   - Helps diagnose setup issues

4. **Fixed artifact upload path** (line 79):
   ```yaml
   path: frontend/prisma/migrations
   ```
   - Previously: `prisma/migrations` (relative to root, doesn't exist)
   - Now: `frontend/prisma/migrations` (correct absolute path)

## Why These Changes Fix the Issue

**Original Problem**:
- Workflow ran from repo root
- `pnpm install` tried to run in root (no `package.json`)
- Prisma commands couldn't find `frontend/prisma/schema.prisma`
- Cache looked for non-existent `pnpm-lock.yaml` in root

**Solution**:
- `defaults.run.working-directory: frontend` sets context for all steps
- All commands now execute where `package.json` and `pnpm-lock.yaml` exist
- Prisma finds its schema at `./prisma/schema.prisma` (relative to frontend)
- Cache correctly locates `frontend/pnpm-lock.yaml`

## Impact
- ✅ **Fixes Setup Node failure**: pnpm cache now finds lock file
- ✅ **Enables Prisma commands**: schema.prisma accessible
- ✅ **Proper artifacts**: migrations uploaded from correct path
- ✅ **Faster runs**: pnpm cache working correctly
