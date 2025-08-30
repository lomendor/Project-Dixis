# API Contracts (used by FE)

Base URL: `${NEXT_PUBLIC_API_BASE_URL}` → `http://127.0.0.1:8001/api/v1`

## GET /products
**Query:** `query` `category` `minPrice` `maxPrice` `page`
**Enhanced with Greek-insensitive search support**
**200 Response (excerpt):**
```json
{
  "data": [
    { "id": 1, "title": "Πορτοκάλια E2E Test", "price": 1.99, "inStock": true, "imageUrl": null, "badges": [] }
  ],
  "meta": { "page": 1, "total": 12 }
}
```

## GET /products/{id}
**200 Response (excerpt):**
```json
{ "id": 1, "title": "Ελληνικός Βασιλικός", "description": "…", "price": 3.50, "inStock": true, "images": [] }
```

## POST /cart/items
**Body:** `{ "productId": number, "qty": number }` → **200** `{ "ok": true }`

## PATCH /cart/items/{id}
**Body:** `{ "qty": number }` → **200** totals recalculated

## DELETE /cart/items/{id}
→ **200** `{ "ok": true }`

## POST /shipping/quote
**Body:** `{ "zip": "11527", "city": "Athens", "weight": 2.3, "volume": 0.01 }`
**200 Response:**
```json
{ "carrier": "Athens Express", "cost": 4.62, "etaDays": 1, "zone": "athens_metro" }
```

**Shipping Zones:**
- Athens Metro (11xxx, 12xxx) → Athens Express, 1 day, €3.50 base
- Thessaloniki (54xxx-56xxx) → Northern Courier, 2 days, €4.00 base
- Islands (80xxx-85xxx) → Island Logistics, 4 days, €8.00 base
- Remote areas → Rural Delivery, 3 days, €7.00 base

## POST /orders  (MVP – COD/unpaid)
**Body:** `{ "items":[{ "productId":1,"qty":2 }], "address":{ "name":"…","zip":"…","city":"…" }, "shipping":{ "cost":3.2 }, "payment":"COD" }`
**200:** `{ "orderId": "ORD-2025-0001" }`

## Notes
- Null-safe fields for images, badges, description.
- Greek search support with accent normalization
- Prices are authoritative on API; FE never trusts client totals.
- Shipping quotes are public (no auth required), throttled at 60/min.