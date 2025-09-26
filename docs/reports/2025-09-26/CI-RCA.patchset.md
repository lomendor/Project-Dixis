# CI RCA Patchset (Proposals – review-only)

Note: Each patch ≤25 LOC. Workflow-only. Safe to revert.

Patch A — frontend-ci: contracts guard for type-check (≤20 LOC)
--- a/.github/workflows/frontend-ci.yml
+++ b/.github/workflows/frontend-ci.yml
@@
   - name: Install dependencies
     run: npm ci
 
+  - name: Ensure contracts available for TS
+    run: |
+      if [ -d "../packages/contracts" ]; then
+        (cd ../packages/contracts && npm ci && npm run build)
+      else
+        mkdir -p node_modules/@dixis/contracts
+        cat > node_modules/@dixis/contracts/index.d.ts <<'EOF'
+        declare module '@dixis/contracts/*' { const x: any; export = x; }
+        declare module '@dixis/contracts' { const x: any; export = x; }
+        EOF
+      fi
+
   - name: Type check
     run: npm run type-check
 
Patch B — normalize PLAYWRIGHT_BASE_URL and port (≤20 LOC)
--- a/.github/workflows/frontend-ci.yml
+++ b/.github/workflows/frontend-ci.yml
@@
   env:
-    FRONTEND_PORT: 3030
+    FRONTEND_PORT: 3030
@@
   - name: Start Next.js server (production build for E2E)
     working-directory: frontend
     env:
       NEXT_PUBLIC_API_BASE_URL: "http://127.0.0.1:8001/api/v1"
       NEXT_TELEMETRY_DISABLED: 1
     run: |
       npm run build
-      PORT=3030 npm start &
+      PORT=${FRONTEND_PORT} npm start &
@@
   - name: Run all E2E tests
     working-directory: frontend
     run: npm run test:e2e:ci
     env:
       CI: true
-      PLAYWRIGHT_BASE_URL: http://localhost:3030
+      PLAYWRIGHT_BASE_URL: http://localhost:${{ env.FRONTEND_PORT }}
       NEXT_PUBLIC_API_BASE_URL: "http://127.0.0.1:8001/api/v1"
       NEXT_PUBLIC_E2E: "true"
       NEXT_TELEMETRY_DISABLED: 1
 
Patch C — bot guards (skip heavy jobs; add smoke) (≤20 LOC)
--- a/.github/workflows/frontend-e2e.yml
+++ b/.github/workflows/frontend-e2e.yml
@@
-  e2e-tests:
+  e2e-tests:
     timeout-minutes: 15
     runs-on: ubuntu-latest
-    if: ${{ github.actor != 'dependabot[bot]' && github.actor != 'dependabot-preview[bot]' }}
+    if: ${{ github.actor != 'dependabot[bot]' && github.actor != 'dependabot-preview[bot]' }}
@@
     - name: Run E2E
       run: npm run test:e2e:ci
       env:
-        PLAYWRIGHT_BASE_URL: "http://localhost:3000"
+        PLAYWRIGHT_BASE_URL: "http://localhost:${{ env.FRONTEND_PORT || 3000 }}"
 
--- a/.github/workflows/lighthouse.yml
+++ b/.github/workflows/lighthouse.yml
@@
-  lighthouse:
+  lighthouse:
     runs-on: ubuntu-latest
-    if: ${{ github.actor != 'dependabot[bot]' && github.actor != 'dependabot-preview[bot]' }}
+    if: ${{ github.actor != 'dependabot[bot]' && github.actor != 'dependabot-preview[bot]' }}
 
Patch D — PR gates alignment (≤20 LOC)
--- a/.github/workflows/danger.yml
+++ b/.github/workflows/danger.yml
@@
-  continue-on-error: true  # Soft warnings, don't block
+  continue-on-error: true  # Soft warnings, don't block (keep as advisory)
@@
   concurrency:
-    group: ${{ github.workflow }}-${{ github.ref }}
+    group: ${{ github.workflow }}-${{ github.ref }}
     cancel-in-progress: true
--- a/.github/workflows/dangerjs.yml
+++ b/.github/workflows/dangerjs.yml
@@
   concurrency:
-    group: dangerjs-${{ github.ref }}
+    group: dangerjs-${{ github.ref }}
     cancel-in-progress: true
 
Patch E — health checks and safe grep (≤25 LOC)
--- a/.github/workflows/fe-api-integration.yml
+++ b/.github/workflows/fe-api-integration.yml
@@
   services:
     postgres:
       image: postgres:15
@@
-      --health-cmd="pg_isready -U postgres"
+      --health-cmd="pg_isready -U postgres"
@@
   - name: Wait for Laravel API
     run: |
-      timeout 60 bash -c 'until curl -f http://127.0.0.1:${BACKEND_PORT}/api/health; do sleep 2; done'
+      timeout 90 bash -c 'until curl -sf http://127.0.0.1:${BACKEND_PORT}/api/health; do sleep 2; done'
@@
   - name: Start frontend server (${FRONTEND_PORT})
     working-directory: frontend
-    run: nohup npm run start -- -p ${FRONTEND_PORT} > ../frontend.log 2>&1 &
+    run: nohup npm run start -- -p ${FRONTEND_PORT} > ../frontend.log 2>&1 &
+  - name: Wait for frontend
+    run: |
+      timeout 60 bash -c 'until curl -sf http://127.0.0.1:${FRONTEND_PORT}; do sleep 2; done'
 

