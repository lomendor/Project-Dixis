# Order Public API Contract v1

**Last Updated**: 2025-12-27
**Endpoints**:
- `GET /api/v1/public/orders` - List orders
- `GET /api/v1/public/orders/{id}` - Order details

## Current State (Pass 43 Complete)

### Order Response

```json
{
  "data": {
    "id": 15,
    "order_number": "ORD-000015",
    "status": "pending",
    "payment_status": "pending",
    "payment_method": "cod",
    "shipping_method": "HOME",
    "shipping_method_label": "Παράδοση στο σπίτι",
    "shipping_address": {
      "name": "John Doe",
      "phone": "+30 6912345678",
      "line1": "Ermou 25",
      "line2": null,
      "city": "Athens",
      "postal_code": "10563",
      "region": "Attica",
      "country": "GR"
    },
    "notes": "Please call before delivery",
    "subtotal": "23.00",
    "tax_amount": "0.00",
    "shipping_amount": "0.00",
    "shipping_cost": "0.00",
    "total": "23.00",
    "total_amount": "23.00",
    "currency": "EUR",
    "created_at": "2025-12-26T22:38:16.000000Z",
    "items_count": 2,
    "items": [...],
    "order_items": [...]
  }
}
```

### Order Item Response

```json
{
  "id": 19,
  "product_id": 3,
  "product_name": "Extra Virgin Olive Oil",
  "product_unit": "bottle",
  "quantity": 1,
  "unit_price": "12.00",
  "price": "12.00",
  "total_price": "12.00",
  "producer": {
    "id": 1,
    "name": "Organic Farm",
    "slug": "organic-farm"
  }
}
```

### Fields Added in Pass 43

| Field | Location | Notes |
|-------|----------|-------|
| `shipping_method_label` | Order | Greek label computed from shipping_method code |
| `shipping_address` | Order | Structured JSON object (was DB field, now exposed) |
| `notes` | Order | Delivery notes (was DB field, now exposed) |
| `producer` | OrderItem | Eager-loaded producer info per item |

### Shipping Method Labels

| Code | Label (EL) |
|------|------------|
| `HOME` | Παράδοση στο σπίτι |
| `PICKUP` | Παραλαβή από κατάστημα |
| `COURIER` | Μεταφορική εταιρεία |

### Frontend Rendering Rules

1. **Shipping Address Panel**
   - Show if `shipping_address` is non-null and has at least `line1` or `city`
   - Hide panel entirely if null/empty (no empty dashes)

2. **Shipping Method**
   - Prefer API-provided `shipping_method_label` if available
   - Fallback to local mapping of `shipping_method` code

3. **Producer Info**
   - Show producer name per item
   - Future: Group items by producer for multi-vendor display

4. **Delivery Notes**
   - Show if `notes` is non-empty
   - Hide section if null/empty

## Database Schema Reference

### orders table

| Column | Type | Notes |
|--------|------|-------|
| shipping_address | json | Nullable, stores address object |
| billing_address | json | Nullable |
| notes | text | Nullable, delivery instructions |
| shipping_method | string | HOME, PICKUP, COURIER |
| shipping_cost | decimal | Shipping fee |

### order_items table

| Column | Type | Notes |
|--------|------|-------|
| producer_id | int | FK to producers table |
| product_id | int | FK to products table |
| product_name | string | Denormalized for history |
| product_unit | string | Denormalized for history |

---

*Contract defined in Pass 43 | 2025-12-27*
*Pass 43 implementation complete | 2025-12-27*
