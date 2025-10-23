# AG85 — RISKS-NEXT
## Risks
- Χαμηλό: In-memory CSV build (μελλοντικά streaming για πολύ μεγάλα datasets).
## Next
- **AG86 (ops):** Σίγαση legacy PG Smoke:
  - PG Smoke μόνο σε main ή όταν αλλάζουν `prisma/**`/`backend/**` ή υπάρχει label `pg-e2e`
  - PRs αλλού → SQLite Smoke (schema.ci.prisma, .env.ci)
