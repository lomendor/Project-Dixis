# TL;DR — Pass 193: Admin Producers UX polish

## Changes
- **UI Refactor**: Converted `/admin/producers` from client to server component
- **Search**: Text search on producer name via `?q=` URL parameter
- **Filter**: Active/All toggle via `?active=only` parameter
- **Sort**: Name ascending/descending via `?sort=name-asc|name-desc`
- **API**: Enhanced GET /api/admin/producers with q/active/sort support
- **E2E Test**: `frontend/tests/admin/producers-ux.spec.ts`

## Technical Details
- Server component uses Next.js 15.5 searchParams (async)
- API queries Prisma with dynamic orderBy based on sort param
- Greek-first UI labels throughout
- No schema/migration changes (idempotent)

## Testing
```bash
npm run test:e2e frontend/tests/admin/producers-ux.spec.ts
```
