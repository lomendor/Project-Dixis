# Feature Flags

## Active Flags

### `products_db_v1`
**Purpose**: Ενεργοποιεί read-only λίστα προϊόντων από DB στο `/products`.

**Status**: OFF by default

**Usage**:
```bash
# Enable in production
PRODUCTS_DB_V1=on npm run build

# Disable (default)
PRODUCTS_DB_V1=off npm run build
```

**Implementation**:
- When ON: `/products` fetches from Neon Postgres via `/api/products`
- When OFF: `/products` uses static demo data
- No impact on cart or checkout flows

**Risks**: Low (isolated to products list only)
