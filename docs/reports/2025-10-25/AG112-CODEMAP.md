# AG112 — CODEMAP

## Modified File

### .github/workflows/migration-clinic.yml
Hardened Migration Clinic workflow by removing pnpm caching and adding explicit setup steps.

**Key Changes from AG111**:

1. **Removed pnpm caching** (lines 39-42):
   ```yaml
   - name: Setup Node (no cache)
     uses: actions/setup-node@v4
     with:
       node-version: '20'
       # NO cache configuration
   ```
   - **Why**: pnpm cache was causing Setup Node failures
   - **Trade-off**: Slightly slower runs, but reliable execution
   - **Future**: Can re-add once root cause identified

2. **Explicit corepack & pnpm setup** (lines 44-48):
   ```yaml
   - name: Enable corepack & setup pnpm
     run: |
       corepack enable
       corepack prepare pnpm@9 --activate
       pnpm -v
   ```
   - **Why**: Ensures pnpm is available and correct version
   - **pnpm@9**: Specifies major version for stability
   - **Verification**: `pnpm -v` confirms setup succeeded

3. **Added diagnostic step** (lines 50-54):
   ```yaml
   - name: Diag workspace
     run: |
       echo "pwd=" && pwd
       echo "ls -la (frontend)" && ls -la
       echo "ls -la (repo root)" && ls -la ..
   ```
   - **Why**: Helps debug working directory issues
   - **Output**: Shows current directory and file structure
   - **Debugging**: Can be removed once workflow is stable

## What This Fixes

**Problem**: AG111 still failed at Setup Node with pnpm cache
**Root Cause**: `cache-dependency-path` might have path resolution issues or permissions problems
**Solution**: Remove caching entirely, use explicit pnpm setup via corepack

## Trade-offs

**Pros**:
- ✅ Eliminates Setup Node failure point
- ✅ Explicit pnpm version control
- ✅ Clear diagnostic output
- ✅ Simpler, more predictable workflow

**Cons**:
- ❌ No pnpm dependency caching (slower installs)
- ❌ Extra diagnostic step (minor overhead)

**Future Optimization**:
Once workflow is stable, can investigate re-adding pnpm cache with different configuration.

## Expected Behavior

### Success Path
1. ✅ Checkout code from repo
2. ✅ Setup Node.js 20 (no cache)
3. ✅ Enable corepack & prepare pnpm@9
4. ✅ Show workspace diagnostic info
5. ✅ Install dependencies (`pnpm install`)
6. ✅ Prepare PostgreSQL databases
7. ✅ Generate Prisma client
8. ✅ Run migration status/deploy/validate
9. ✅ Upload migration artifacts

### Failure Scenarios
- If pnpm setup fails → Check corepack availability
- If install fails → Check pnpm-lock.yaml integrity
- If Prisma fails → Check DATABASE_URL, schema issues
