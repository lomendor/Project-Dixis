# QA V1 Runbook - Dixis Production Verification

**Version**: 1.0
**Last Updated**: 2026-01-22
**Target**: dixis.gr (production)

---

## Σκοπός

Αυτό το runbook περιγράφει τα 4 βασικά flows που πρέπει να λειτουργούν σωστά για V1 launch readiness.

---

## Pre-flight Checks

Πριν ξεκινήσεις τα flows, επιβεβαίωσε:

```bash
# 1. Health check
curl https://dixis.gr/api/healthz
# Expected: {"status":"ok"}

# 2. Products API
curl https://dixis.gr/api/v1/public/products
# Expected: {"data":[...]} με products

# 3. Ή τρέξε το script
./scripts/prod-facts.sh
```

| Check | Expected |
|-------|----------|
| API healthz | `{"status":"ok"}` |
| Products API | Returns data array |
| COD payment | enabled |
| Stripe | configured |
| Email (Resend) | configured |

---

## Flow A: Guest Checkout (COD)

**Σκοπός**: Επιβεβαίωση ότι ανώνυμοι χρήστες μπορούν να παραγγείλουν με αντικαταβολή.

### Βήματα (UI)

1. Άνοιξε https://dixis.gr
2. Κάνε browse στα products
3. Πρόσθεσε ένα product στο καλάθι
4. Πάτα "Checkout" / "Ολοκλήρωση"
5. Συμπλήρωσε:
   - Όνομα: Test Guest
   - Email: test-guest@example.com
   - Διεύθυνση: Test Address 123, Athens 10000
   - Τηλέφωνο: 6900000000
6. Επίλεξε "Αντικαταβολή (COD)"
7. Πάτα "Ολοκλήρωση Παραγγελίας"

### Βήματα (API - για automation)

```bash
# Create order as guest
curl -X POST https://dixis.gr/api/v1/public/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"product_id": 1, "quantity": 1}],
    "customer": {
      "name": "QA Guest",
      "email": "qa-guest@test.dixis.gr",
      "phone": "6900000000",
      "address": {
        "street": "QA Street 1",
        "city": "Athens",
        "postal_code": "10000",
        "country": "GR"
      }
    },
    "payment_method": "COD"
  }'
```

### Expected Result

- Order created με status `pending`
- Order number format: `ORD-XXXXXX`
- Payment method: `COD`

### Evidence Example

```
Order #97 | ORD-000097 | pending | COD | €12.50
```

---

## Flow B: Auth User Checkout (Card Payment)

**Σκοπός**: Επιβεβαίωση ότι logged-in users μπορούν να πληρώσουν με κάρτα.

### Βήματα (UI)

1. Άνοιξε https://dixis.gr/auth/login
2. Κάνε login ή register νέο account
3. Πρόσθεσε product στο καλάθι
4. Πάτα "Checkout"
5. Επίλεξε "Πληρωμή με Κάρτα"
6. Στο Stripe form:
   - Card: 4242 4242 4242 4242
   - Exp: 12/26
   - CVC: 123
7. Ολοκλήρωσε την παραγγελία

### Βήματα (API)

```bash
# 1. Register/Login
TOKEN=$(curl -s -X POST https://dixis.gr/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"consumer@example.com","password":"password"}' \
  | jq -r '.data.token')

# 2. Create order
ORDER_ID=$(curl -s -X POST https://dixis.gr/api/v1/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"product_id": 1, "quantity": 1}],
    "payment_method": "card",
    "shipping_address": {...}
  }' | jq -r '.data.id')

# 3. Initialize payment
curl -X POST "https://dixis.gr/api/v1/payments/orders/$ORDER_ID/init" \
  -H "Authorization: Bearer $TOKEN"
```

### Expected Result

- Order created με status `pending_payment`
- Payment Intent created (pi_xxx...)
- Stripe returns `client_secret`
- After payment: status → `paid`

### Evidence Example

```
Order #98 | User #30 | pi_3SsBW3Q9Xukpkfmb2nyMQwaK | €15.99
```

---

## Flow C: Producer Flow

**Σκοπός**: Επιβεβαίωση ότι producers μπορούν να διαχειριστούν products.

### Προαπαιτούμενα

- Producer account με approved producer profile
- Test account: `producer@example.com` / `password`

### Βήματα (UI)

1. Άνοιξε https://dixis.gr/auth/login
2. Login με producer account
3. Πήγαινε στο Producer Dashboard (`/producer`)
4. Πάτα "Νέο Προϊόν" / "Add Product"
5. Συμπλήρωσε:
   - Όνομα: QA Test Product
   - Τιμή: 10.00
   - Περιγραφή: Test product for QA
   - Category: (επίλεξε μία)
6. Αποθήκευσε

### Βήματα (API)

```bash
# 1. Login as producer
TOKEN=$(curl -s -X POST https://dixis.gr/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"producer@example.com","password":"password"}' \
  | jq -r '.data.token')

# 2. Create product
curl -X POST https://dixis.gr/api/v1/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "QA V1 Product",
    "price": 10.00,
    "description": "QA test product",
    "category_id": 1,
    "stock_quantity": 100,
    "status": "available"
  }'

# 3. Verify public visibility
curl https://dixis.gr/api/v1/public/products/{product_id}
```

### Expected Result

- Product created με unique ID
- Status: `available` (auto-approved for existing producers)
- Visible στο public products API

### Evidence Example

```
Product #10 | "QA V1 Product" | €10.00 | available | Producer: Green Farm Co.
```

---

## Flow D: Admin Flow

**Σκοπός**: Επιβεβαίωση ότι admins μπορούν να διαχειριστούν orders.

### Προαπαιτούμενα

- Admin account
- Test account: `admin@example.com` / `password`

### Βήματα (UI)

1. Άνοιξε https://dixis.gr/auth/login
2. Login με admin account
3. Πήγαινε στο Admin Dashboard (`/admin`)
4. Πάτα "Orders" / "Παραγγελίες"
5. Βρες ένα order (π.χ. από Flow A)
6. Άλλαξε status: `pending` → `processing`
7. Αποθήκευσε

### Βήματα (API)

```bash
# 1. Login as admin
TOKEN=$(curl -s -X POST https://dixis.gr/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | jq -r '.data.token')

# 2. List orders
curl -s https://dixis.gr/api/v1/admin/orders \
  -H "Authorization: Bearer $TOKEN"

# 3. Update order status
curl -X PATCH https://dixis.gr/api/v1/admin/orders/{order_id}/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "processing"}'
```

### Expected Result

- Admin sees all orders
- Status update succeeds
- `updated_at` timestamp changes

### Evidence Example

```
Order #97 | pending → processing | updated 2026-01-22T00:14:46Z
```

---

## Post-QA Checklist

Μετά την εκτέλεση όλων των flows:

- [ ] All 4 flows PASS
- [ ] Evidence recorded (order IDs, product IDs, timestamps)
- [ ] No 500 errors στα logs
- [ ] Email notifications sent (if applicable)

---

## Troubleshooting

### API returns 401

- Token expired → Re-login
- Wrong credentials → Check test accounts

### API returns 500

- Check backend logs: `railway logs`
- Check Sentry for errors

### Stripe payment fails

- Use test card: 4242 4242 4242 4242
- Check Stripe dashboard for errors
- Verify API keys configured

### Product not visible

- Check status is `available`
- Verify producer is approved
- Clear CDN cache if applicable

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Consumer | consumer@example.com | password |
| Producer | producer@example.com | password |
| Admin | admin@example.com | password |

**Note**: Αυτά είναι seeded test accounts. Μην τα χρησιμοποιείς σε production με real data.

---

## Related Docs

- `docs/OPS/PROD-FACTS-LAST.md` - Latest health check
- `docs/PRODUCT/FLOWS.md` - Flow definitions
- `docs/AGENT/SUMMARY/Pass-V1-QA-EXECUTE-01-*.md` - QA execution records

---

_QA-V1-RUNBOOK v1.0 | 2026-01-22_
