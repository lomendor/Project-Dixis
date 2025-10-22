# AG75 — RISKS-NEXT
## Risks
- Very low: API path active μόνο με `?useApi=1`. Default συμπεριφορά παραμένει.
## Next
- **AG76 (backend)**: Implement real providers
  - `pgRepo` (Prisma → PostgreSQL) για dev/prod
  - `sqliteRepo` (SQLite) για CI
  - Προσθήκη `pg-e2e` gated test
