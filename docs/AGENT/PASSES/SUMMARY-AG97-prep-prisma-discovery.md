# AG97-prep — Prisma schema discovery

- Date: 2025-10-24 17:30 UTC
- Purpose: Ανίχνευση database schema πριν την υλοποίηση facet aggregations (AG97.1)

## Schemas found

- `frontend/prisma/schema.prisma` (main schema)
- `frontend/prisma/schema.ci.prisma` (CI-specific schema)

## Order Model Analysis

### Prisma Schema (frontend/prisma/schema.prisma)

```prisma
model Order {
  id             String      @id @default(cuid())
  publicToken    String      @unique @default(uuid())
  buyerPhone     String
  buyerName      String
  shippingLine1  String
  shippingLine2  String?
  shippingCity   String
  shippingPostal String
  total          Float
  status         String      @default("pending")  // ⚠️ String, not enum!
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  items          OrderItem[]

  @@index([buyerPhone, createdAt])
  @@index([status, createdAt])      // ✅ Perfect for aggregations!
  @@index([publicToken])
}
```

### Key Findings

1. **Status Field Type**: `String` (not enum!)
   - Default value: `"pending"`
   - No database-level enum constraint
   - Index exists: `@@index([status, createdAt])` - optimal for GROUP BY queries

2. **Status Values** (from frontend/src/app/admin/orders/_components/AdminOrdersMain.tsx):
   ```typescript
   type Status = 'pending'|'paid'|'shipped'|'cancelled'|'refunded';
   ```

3. **Indexed Fields for Filtering**:
   - `status` + `createdAt` (composite index)
   - `buyerPhone` + `createdAt` (composite index)
   - `publicToken` (unique index)

4. **Filterable Fields** (from AG95 useOrdersFilters):
   - `status: string`
   - `q: string` (search by Order ID or customer name)
   - `fromDate: string` (ISO date)
   - `toDate: string` (ISO date)  
   - `sort: 'createdAt' | '-createdAt'`

## Laravel Backend Note

Backend has different Order model structure (app/Models/Order.php) with:
- `user_id` (nullable)
- `payment_status`
- `payment_method`
- Refund fields

⚠️ **This appears to be a different system** - Frontend uses Prisma directly with simpler Order schema.

## Proposed Aggregation Implementation

### Option 1: Prisma groupBy (Recommended)

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getFacetTotals(query: FacetQuery): Promise<FacetTotals> {
  // Build where clause from filters
  const where: any = {};
  
  if (query.status) {
    where.status = query.status;
  }
  
  if (query.fromDate || query.toDate) {
    where.createdAt = {};
    if (query.fromDate) where.createdAt.gte = new Date(query.fromDate);
    if (query.toDate) where.createdAt.lte = new Date(query.toDate);
  }
  
  if (query.q) {
    where.OR = [
      { id: { contains: query.q, mode: 'insensitive' } },
      { buyerName: { contains: query.q, mode: 'insensitive' } },
      { buyerPhone: { contains: query.q } },
    ];
  }

  // Aggregate by status
  const grouped = await prisma.order.groupBy({
    by: ['status'],
    where,
    _count: { _all: true },
  });

  // Get total count
  const total = await prisma.order.count({ where });

  // Transform to FacetTotals format
  const totals: Record<string, number> = {};
  grouped.forEach(g => {
    totals[g.status] = g._count._all;
  });

  return { totals, total };
}
```

### Option 2: Raw SQL (Alternative)

```sql
-- Count by status with filters
SELECT 
  status, 
  COUNT(*) as count
FROM "Order"
WHERE 
  (status = $1 OR $1 IS NULL)
  AND (created_at >= $2 OR $2 IS NULL)
  AND (created_at <= $3 OR $3 IS NULL)
  AND (
    id ILIKE $4 
    OR buyer_name ILIKE $4 
    OR buyer_phone ILIKE $4 
    OR $4 IS NULL
  )
GROUP BY status
ORDER BY status;

-- Total count
SELECT COUNT(*) FROM "Order" WHERE /* same filters */;
```

## Recommendations for AG97.1

1. **Use Prisma groupBy** - Type-safe, optimal, leverages existing index
2. **Reuse WHERE clause logic** - Same filters for both groupBy and count
3. **Test with CI seed data** - Ensure aggregations match expected values
4. **Add pg-e2e label** - Gate PR on Postgres E2E tests
5. **Consider caching** - Facet totals could be cached (5-10s TTL)

## Performance Notes

- ✅ Composite index `[status, createdAt]` exists - aggregations will be fast
- ✅ All filter fields are indexed or part of composite indexes
- ⚠️ ILIKE search on `buyerName` might be slow for large datasets
- 💡 Consider adding GIN index for full-text search if needed

## Next Steps

- **AG97.1**: Implement Prisma groupBy in `facets.provider.ts` (pg mode)
- **AG97.2**: Wire provider to `/api/admin/orders/facets` route
- **AG97.3**: E2E test with CI seed data + verify aggregations
