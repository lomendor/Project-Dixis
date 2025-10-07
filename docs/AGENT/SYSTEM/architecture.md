# System Architecture (high-level)
- Frontend: Next.js (EL-first), Playwright tests
- API Routes: Next.js `app/api/*`, server actions (Zod)
- Auth/Session: cookie `dixis_session` (guards)
- Data: Prisma ORM → Postgres/SQLite ανά περιβάλλον
- Observability: CI smoke/e2e, STATE.md per pass

Δες: routes.md (scan-routes), db-schema.md (scan-prisma), env.md (registry)
