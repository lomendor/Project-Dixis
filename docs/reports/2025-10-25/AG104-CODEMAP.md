# AG104 — CODEMAP

## New Files

### frontend/src/server/db/prisma.ts
- **Purpose**: Shared PrismaClient singleton for Next.js/ESM safety
- **Pattern**: Uses globalThis to prevent multiple connections during dev hot-reload
- **Logging**: Warn/error in development, error only in production

**Code**:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

## Modified Files

### frontend/src/app/api/admin/orders/facets/route.ts
- **Change**: Import shared `prisma` from `@/server/db/prisma`
- **Removed**: Dynamic `import('@prisma/client')` and `new PrismaClient()` instantiation
- **Impact**: Uses singleton client in PG aggregation path (when `DIXIS_AGG_PROVIDER=pg`)

**Before (lines 17-18)**:
```typescript
const { PrismaClient } = await import('@prisma/client');
const prisma = new PrismaClient();
```

**After (line 5, 19)**:
```typescript
import { prisma } from '@/server/db/prisma';
// ...
const provider = createPgFacetProvider(() => prisma);
```

## Why This Change

### Problem: Multiple Prisma Connections
- Dynamic `new PrismaClient()` creates a new connection pool on every API call
- In dev mode with hot-reload, this can exhaust database connections
- Production mode has similar issues under high concurrency

### Solution: Singleton Pattern
- Single global PrismaClient instance reused across all requests
- Next.js-safe pattern using `globalThis` for hot-reload compatibility
- Reduces connection overhead and improves performance

### Benefits
1. **Connection Pooling**: Single connection pool shared across requests
2. **Dev Experience**: No connection exhaustion during hot-reload
3. **Performance**: Reduced latency from connection reuse
4. **Stability**: Fewer connection-related errors in production

## Impact
- ✅ **Zero runtime change when `DIXIS_AGG_PROVIDER != pg`** (demo mode unaffected)
- ✅ **PG path uses singleton**: More efficient connection management
- ✅ **Backward compatible**: Same API contract, same behavior
- ✅ **Test coverage**: Existing pg-e2e test validates this works
