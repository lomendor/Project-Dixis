## AG-CI-FAST-LOOP-01
- FAST LOOP: `quality-gates` (light checks) τρέχει σε κάθε PR. `heavy-checks` τρέχει ΜΟΝΟ όταν το PR δεν είναι draft και δεν έχει label `ci:light`.
- e2e-full: Nightly + manual (`e2e-full.yml`).
- Concurrency: cancel-in-progress για PR pipelines.
