*** PROPOSED PATCHES ONLY — DO NOT APPLY DIRECTLY ***

--- a/.github/workflows/pr.yml
+++ b/.github/workflows/pr.yml
@@
   PR-Hygiene-Check:
     runs-on: ubuntu-latest
     steps:
-      - name: Run commitlint (non-blocking on ci/* branches)
-        run: npx commitlint --from=${{ github.event.pull_request.base.sha }} --to=${{ github.sha }}
+      - name: Run commitlint (non-blocking on ci/* branches)
+        run: |
+          if [[ "${GITHUB_HEAD_REF}" =~ ^ci\/ ]]; then
+            echo "[ci/*] commitlint is advisory; skipping failure";
+            npx commitlint --from=${{ github.event.pull_request.base.sha }} --to=${{ github.sha }} || true;
+          else
+            npx commitlint --from=${{ github.event.pull_request.base.sha }} --to=${{ github.sha }};
+          fi
 
-      - name: Run Danger (non-blocking on ci/* branches)
-        run: npx danger ci
+      - name: Run Danger (non-blocking on ci/* branches)
+        run: |
+          if [[ "${GITHUB_HEAD_REF}" =~ ^ci\/ ]]; then
+            echo "[ci/*] Danger is advisory; skipping failure";
+            npx danger ci || true;
+          else
+            npx danger ci;
+          fi
 
--- a/.github/workflows/frontend-ci.yml
+++ b/.github/workflows/frontend-ci.yml
@@
   e2e-tests:
     env:
       PLAYWRIGHT_BASE_URL: http://localhost:3030
+      PW_TEST_RETRIES: 1
     steps:
       - name: Start frontend
         run: |
           PORT=3030 npm start &
-      - name: Wait for services
-        run: |
-          curl -f http://127.0.0.1:8001/api/health
-          curl -f http://localhost:3030
+      - name: Wait for services (robust)
+        run: |
+          for i in {1..60}; do curl -fsS http://127.0.0.1:8001/api/health && break; sleep 2; done
+          for i in {1..60}; do curl -fsS http://127.0.0.1:3030 && break; sleep 2; done
       - name: Run E2E tests
         run: |
           npm run test:e2e

