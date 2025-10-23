# CI SMOKE GATING — Postgres Smoke
Τρέχει **μόνο**:
- σε `push` στο `main`, ή
- σε PR με label `pg-e2e`.

Στόχος: να αποφύγουμε advisory αποτυχίες PG Smoke σε PRs που δεν αγγίζουν DB. Για PR που αφορά DB/Prisma, πρόσθεσε label `pg-e2e`.
(Προαιρετική βελτίωση επόμενου pass: path-gating με paths-filter για `prisma/**` και `backend/**`.)
