# API Documentation - MVP Polish Pack 01

## Base Configuration
**Base URL**: `${NEXT_PUBLIC_API_BASE_URL}` → `http://127.0.0.1:8001/api/v1`  
**Authentication**: Bearer token via `Authorization` header  
**Rate Limiting**: 60 requests/minute for shipping endpoints

## Product Catalog

### GET /public/products
**Enhanced Search & Greek Support**
**Query Parameters:**
- `search` - Greek-insensitive search with accent normalization
- `category` - Category filtering
- `producer` - Producer ID filtering 
- `min_price` / `max_price` - Price range filtering
- `organic` - Boolean organic filter
- `sort` - `created_at|name|price`
- `dir` - `asc|desc`
- `page` - Pagination
- `per_page` - Results per page (default: 20)

**200 Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Πορτοκάλια Βιολογικά",
      "price": "1.99",
      "unit": "kg",
      "stock": 50,
      "is_active": true,
      "description": "Φρέσκα βιολογικά πορτοκάλια από την Ελλάδα",
      "categories": [
        { "id": 1, "name": "Φρούτα", "slug": "frouta" }
      ],
      "images": [
        {
          "id": 1,
          "url": "/images/products/oranges.jpg",
          "alt_text": "Βιολογικά πορτοκάλια",
          "is_primary": true
        }
      ],
      "producer": {
        "id": 1,
        "name": "Αγρότης Παπαδόπουλος",
        "business_name": "Παπαδόπουλος ΑΕ",
        "location": "Κρήτη",
        "description": "Βιολογική καλλιέργεια από το 1980"
      }
    }
  ],
  "current_page": 1,
  "last_page": 3,
  "per_page": 20,
  "total": 45
}
```

### GET /public/products/{id}
**Product Detail with Enhanced Information**
**200 Response:**
```json
{
  "id": 1,
  "name": "Ελληνικός Βασιλικός",
  "description": "Αρωματικός βασιλικός από τη Μεσσηνία",
  "price": "3.50",
  "unit": "δέσμη",
  "stock": 25,
  "is_active": true,
  "categories": [...],
  "images": [...],
  "producer": {
    "id": 2,
    "name": "Μαρία Γεωργίου",
    "business_name": "Αρωματικά Μεσσηνίας",
    "location": "Καλαμάτα, Μεσσηνία",
    "phone": "+30 27210 12345",
    "email": "maria@aromata-messinia.gr",
    "website": "https://aromata-messinia.gr"
  }
}
```

## Shopping Cart Management

### GET /cart/items
**Retrieve Cart Contents**
**200 Response:**
```json
{
  "items": [
    {
      "id": 1,
      "quantity": 2,
      "product": { /* Product object */ },
      "subtotal": "7.00"
    }
  ],
  "total_items": 3,
  "total_amount": "15.50"
}
```

### POST /cart/items
**Add Item to Cart**
**Request Body:**
```json
{ "product_id": 1, "quantity": 2 }
```
**200 Response:**
```json
{
  "cart_item": {
    "id": 1,
    "quantity": 2,
    "product": { /* Product object */ },
    "subtotal": "7.00"
  }
}
```

### PUT /cart/items/{id}
**Update Cart Item Quantity**
**Request Body:**
```json
{ "quantity": 3 }
```
**200 Response:**
```json
{
  "cart_item": {
    "id": 1,
    "quantity": 3,
    "subtotal": "10.50"
  }
}
```

### DELETE /cart/items/{id}
**Remove Item from Cart**
**200 Response:** `{ "message": "Item removed from cart" }`

### POST /cart/clear
**Clear All Cart Items**
**200 Response:** `{ "message": "Cart cleared" }`

## Shipping Integration

### POST /shipping/quote
**Real-time Shipping Cost Calculation**
**Request Body:**
```json
{
  "zip": "11527",
  "city": "Athens",
  "weight": 2.3,
  "volume": 0.015
}
```

**200 Response:**
```json
{
  "carrier": "Athens Express",
  "cost": 4.62,
  "eta_days": 1,
  "zone": "athens_metro",
  "quote_id": "QTE-20250829-001",
  "valid_until": "2025-08-29T15:30:00Z"
}
```

**Error Responses:**
```json
// 400 - Invalid postal code
{ "error": "Invalid postal code format", "code": "INVALID_ZIP" }

// 429 - Rate limit exceeded  
{ "error": "Too many requests. Please wait before retrying.", "retry_after": 60 }

// 503 - Service unavailable
{ "error": "Shipping service temporarily unavailable", "code": "SERVICE_DOWN" }
```

**Shipping Zones & Pricing:**

| Zone | Postal Codes | Carrier | ETA | Base Cost | Weight Multiplier |
|------|-------------|---------|-----|-----------|------------------|
| Athens Metro | 10xxx-12xxx | Athens Express | 1 day | €3.50 | €0.50/kg |
| Thessaloniki | 54xxx-56xxx | Northern Courier | 2 days | €4.00 | €0.60/kg |
| Major Cities | 20xxx-49xxx, 60xxx-73xxx | City Logistics | 2 days | €5.00 | €0.70/kg |
| Islands | 80xxx-85xxx | Island Logistics | 4 days | €8.00 | €1.20/kg |
| Remote Areas | All others | Rural Delivery | 3 days | €7.00 | €1.00/kg |

## Order Management

### POST /orders/checkout
**Create Order from Cart**
**Request Body:**
```json
{
  "shipping_address": {
    "name": "Γιάννης Παπαδόπουλος",
    "email": "giannis@example.com",
    "phone": "+30 6912345678",
    "address": "Ερμού 123",
    "city": "Αθήνα", 
    "postal_code": "11527",
    "notes": "2ος όροφος"
  },
  "shipping_method": "athens_express",
  "shipping_cost": 4.62,
  "payment_method": "COD"
}
```

**200 Response:**
```json
{
  "order": {
    "id": 1,
    "user_id": 1,
    "subtotal": "15.50",
    "shipping_amount": "4.62",
    "tax_amount": "0.00",
    "total_amount": "20.12",
    "payment_status": "pending",
    "payment_method": "COD",
    "status": "pending",
    "shipping_method": "athens_express",
    "shipping_carrier": "Athens Express",
    "shipping_cost": 4.62,
    "shipping_eta_days": 1,
    "postal_code": "11527",
    "city": "Αθήνα",
    "created_at": "2025-08-29T12:00:00Z",
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "quantity": 2,
        "price": "3.50",
        "total_price": "7.00",
        "product_name": "Ελληνικός Βασιλικός",
        "product_unit": "δέσμη"
      }
    ]
  }
}
```

### GET /orders/{id}
**Retrieve Order Details**
**200 Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "subtotal": "15.50",
  "shipping_amount": "4.62",
  "total_amount": "20.12",
  "payment_status": "pending",
  "payment_method": "COD",
  "status": "pending",
  "shipping_method": "athens_express",
  "shipping_carrier": "Athens Express",
  "shipping_address": "Ερμού 123, 11527 Αθήνα",
  "notes": "2ος όροφος",
  "created_at": "2025-08-29T12:00:00Z",
  "items": [ /* Order items array */ ]
}
```

## Authentication

### POST /auth/login
**User Authentication**
**Request Body:**
```json
{
  "email": "consumer@example.com",
  "password": "password"
}
```

**200 Response:**
```json
{
  "user": {
    "id": 1,
    "name": "Consumer User",
    "email": "consumer@example.com",
    "role": "consumer"
  },
  "access_token": "1|abc123...",
  "token_type": "Bearer"
}
```

### POST /auth/logout
**Revoke Authentication Token**
**200 Response:** `{ "message": "Successfully logged out" }`

## Error Handling

### Standard Error Format
```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required."],
    "zip": ["The zip field must be at least 5 characters."]
  }
}
```

### HTTP Status Codes
- **200** - Success
- **201** - Created
- **400** - Bad Request (validation errors)
- **401** - Unauthorized (invalid/missing token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **422** - Unprocessable Entity (validation failed)
- **429** - Too Many Requests (rate limited)
- **500** - Internal Server Error
- **503** - Service Unavailable

## Greek Localization Support

### Currency Formatting
All monetary values in responses use Greek formatting:
- API returns: `"15.50"` (string, dot decimal)
- Frontend displays: `"15,50 €"` (Greek locale formatting)

### Text Encoding
- All text fields support full UTF-8 encoding
- Greek characters (Α-Ω, α-ω) including accented characters (άέήίόύώ)
- Proper sorting with Greek collation rules

### Search Normalization  
The search functionality handles Greek text intelligently:
- Accent removal: `τομάτα` → `τοματα`
- Synonym expansion: `βιολογικό` → `['βιολογικο', 'bio', 'organic']`
- Fuzzy matching with 20% error tolerance for Greek words >4 characters

## Rate Limiting & Performance

### Endpoints with Rate Limits
- `POST /shipping/quote` - 60/minute per IP
- `POST /auth/login` - 5/minute per IP
- All other endpoints - 1000/minute per authenticated user

### Performance Expectations
- **Search queries**: <100ms response time
- **Product listings**: <200ms response time  
- **Shipping quotes**: <500ms response time
- **Order creation**: <1000ms response time

### Caching Headers
```
Cache-Control: public, max-age=300  # Product listings (5 minutes)
Cache-Control: private, max-age=60  # User-specific data (1 minute)
Cache-Control: no-cache             # Cart and order data
```

## Development & Testing

### Test Data Access
**E2E Test Seeder** provides consistent test data:
- Consumer account: `consumer@example.com` / `password`
- Producer account: `producer@example.com` / `password`
- Greek product names with proper categorization
- All shipping zones with test postal codes

### API Testing Examples
```bash
# Health check
curl http://127.0.0.1:8001/api/v1/health

# Search for Greek products
curl "http://127.0.0.1:8001/api/v1/public/products?search=τομάτα"

# Get shipping quote
curl -X POST http://127.0.0.1:8001/api/v1/shipping/quote \
  -H "Content-Type: application/json" \
  -d '{"zip":"11527","city":"Athens","weight":2,"volume":0.01}'

# Create order (requires authentication)
curl -X POST http://127.0.0.1:8001/api/v1/orders/checkout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"shipping_address":{...},"payment_method":"COD"}'
```

## Migration Notes

### Breaking Changes in MVP Polish Pack 01
- `POST /orders` endpoint changed to `POST /orders/checkout`
- Cart response structure enhanced with `total_items` field
- Product response includes full producer information
- Shipping zones restructured with new pricing model

### Backward Compatibility  
- All existing product and authentication endpoints remain unchanged
- Legacy cart endpoints still supported alongside new structure
- Previous order format accepted but deprecated
- Prices are authoritative on API; FE never trusts client totals.
- Shipping quotes are public (no auth required), throttled at 60/min.