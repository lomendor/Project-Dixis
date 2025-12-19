# DATA DEPENDENCY MAP

**Last Updated**: 2025-12-19 17:56 UTC
**Purpose**: Define entity relationships, permissions, and implementation order for Project Dixis marketplace

---

## 📊 ENTITY RELATIONSHIPS

### Core Entities

```
Producer (1) ──┬──→ (N) Products
               ├──→ (N) Media (producer profile images)
               └──→ (1) User (authentication)

Product (1) ────┬──→ (N) Media (product images)
                ├──→ (N) OrderItems
                ├──→ (N) Categories (M:N via product_category)
                ├──→ (1) Producer (required: NOT NULL FK)
                └──→ (1) Price (embedded in product table)

Order (1) ──────┬──→ (N) OrderItems
                ├──→ (1) User (customer)
                ├──→ (1) Address (shipping)
                ├──→ (1) Payment
                └──→ (1) Shipment

OrderItem (N) ──┬──→ (1) Product
                └──→ (1) Order

User (1) ────────┬──→ (N) Orders (as customer)
                 ├──→ (1) Role (customer/producer/admin)
                 └──→ (N) Addresses
```

### Detailed Relationships

| Entity | Owns/Contains | Required FK | Optional FK | Validation |
|--------|---------------|-------------|-------------|------------|
| **Producer** | Products, Media | user_id | - | Must have verified user |
| **Product** | Media, Price | producer_id | - | Price > 0, Stock >= 0 |
| **Category** | - | - | - | Unique name |
| **Order** | OrderItems, Payment | user_id, address_id | shipment_id | Total > 0 |
| **OrderItem** | - | order_id, product_id | - | Quantity > 0 |
| **Address** | - | user_id | - | Valid postal code |
| **Payment** | - | order_id | - | Amount matches order total |
| **Shipment** | - | order_id | - | Tracking number unique |

---

## 🔐 PERMISSIONS MATRIX

### Producer Role
| Entity | Create | Read | Update | Delete | Constraints |
|--------|--------|------|--------|--------|-------------|
| Product | ✅ Own | ✅ Own | ✅ Own | ✅ Own | producer_id = current user |
| Media | ✅ Own | ✅ Own | ✅ Own | ✅ Own | Belongs to own products |
| Order | ❌ | ✅ Own orders | ✅ Status only | ❌ | Orders containing own products |
| Category | ❌ | ✅ All | ❌ | ❌ | Read-only |

**Authorization:** `ProductPolicy::update()` checks `product.producer_id === auth.user.producer_id`

### Admin Role
| Entity | Create | Read | Update | Delete | Constraints |
|--------|--------|------|--------|--------|-------------|
| Product | ✅ Any | ✅ All | ✅ All | ✅ All | Can override producer ownership |
| Producer | ✅ | ✅ All | ✅ All | ✅ All | Full control |
| Category | ✅ | ✅ All | ✅ All | ✅ All | Manage taxonomy |
| Order | ✅ | ✅ All | ✅ All | ✅ All | Customer service |

**Authorization:** `AdminPolicy` bypasses producer_id checks

### Customer Role
| Entity | Create | Read | Update | Delete | Constraints |
|--------|--------|------|--------|--------|-------------|
| Product | ❌ | ✅ Published | ❌ | ❌ | Public catalog only |
| Order | ✅ Own | ✅ Own | ✅ Own (cancel) | ❌ | user_id = current user |
| Address | ✅ Own | ✅ Own | ✅ Own | ✅ Own | Belongs to user |
| Cart | ✅ | ✅ | ✅ | ✅ | Session-based |

---

## 🚀 EXECUTION ORDER (MVP Implementation)

### Stage 1: Foundation ✅ (DONE)
**Goal:** Core entities + auth working

| Component | Status | DoD | Evidence |
|-----------|--------|-----|----------|
| Producer model | ✅ DONE | DB table exists, has products relationship | `backend/app/Models/Producer.php` |
| Product model | ✅ DONE | DB table exists, producer_id NOT NULL FK | `backend/database/migrations/*_create_products_table.php` |
| User auth | ✅ DONE | Login/register work (200/307) | `docs/OPS/PROD-FACTS-LAST.md` |
| Products API | ✅ DONE | `/api/v1/public/products` returns data | HTTP 200 with 4 products |

### Stage 2: Permissions → (NEXT)
**Goal:** Enforce ownership + admin override

| Component | Status | DoD | Evidence Required |
|-----------|--------|-----|-------------------|
| ProductPolicy | 🔄 AUDIT | Producer can ONLY edit own products | Backend policy test passes |
| Dashboard | 🔄 AUDIT | Producer dashboard shows ONLY own products | Frontend E2E test |
| Admin override | 🔄 AUDIT | Admin can edit ANY product | Admin panel test |
| Tests | 🔄 AUDIT | Authorization test coverage > 90% | PHPUnit + Playwright |

**Next PR:** Producer permissions audit (read-only, docs output)

### Stage 3: Dashboard Edit
**Goal:** Producer can manage own products via UI

| Component | Status | DoD | Evidence Required |
|-----------|--------|-----|-------------------|
| Product form | ⏳ TODO | Create/edit product via dashboard | E2E test passes |
| Media upload | ⏳ TODO | Upload product images | File saved + URL returned |
| Stock management | ⏳ TODO | Update stock levels | DB updated, reflected in API |
| Validation | ⏳ TODO | Price > 0, name not empty | Form validation works |

**Estimated:** 2-3 sprints

### Stage 4: Cart → Checkout → Orders
**Goal:** Customer can buy products

| Component | Status | DoD | Evidence Required |
|-----------|--------|-----|-------------------|
| Add to cart | ⏳ TODO | Product added to cart | Cart shows item |
| Checkout flow | ⏳ TODO | User completes checkout | Order created in DB |
| Payment | ⏳ TODO | Viva Wallet integration | Payment confirmed |
| Order email | ⏳ TODO | Confirmation email sent | Email logged/sent |

**Estimated:** 3-4 sprints

### Stage 5: Shipping
**Goal:** Orders can be fulfilled + tracked

| Component | Status | DoD | Evidence Required |
|-----------|--------|-----|-------------------|
| Shipment creation | ⏳ TODO | Producer creates shipment | Tracking number assigned |
| Carrier integration | ⏳ TODO | ACS/ELTA API integration | Label generated |
| Tracking | ⏳ TODO | Customer can track order | Tracking page shows status |

**Estimated:** 2-3 sprints

---

## 📋 CURRENT STATE (2025-12-19)

### ✅ What Exists Today

**Backend (Laravel 11):**
- ✅ Producer model with products relationship
- ✅ Product model with producer_id (NOT NULL, FK)
- ✅ Categories with M:N pivot
- ✅ ProductPolicy (needs audit for ownership)
- ✅ Public products API (`/api/v1/public/products`)
- ✅ Seeders with 4 demo products

**Frontend (Next.js 15):**
- ✅ Products list page (`/products`) - renders 4 products
- ✅ Product detail page (`/products/[id]`)
- ✅ Auth pages (`/auth/login`, `/auth/register`)
- ✅ Producer dashboard (basic)
- ✅ Cart (basic, session-based)

**Infrastructure:**
- ✅ PROD deployed at dixis.gr (all endpoints 200/307)
- ✅ Monitoring (MON1 + prod-smoke)
- ✅ CI/CD (GitHub Actions)

### ⚠️ What's Missing (Priority Order)

**P0 (Critical - Blocks MVP):**
1. **Permission enforcement audit** - Verify ProductPolicy works correctly
2. **Checkout flow** - Cart → Order creation (no real payment yet)
3. **Order confirmation** - Email/notification

**P1 (High - MVP feature):**
4. **Producer dashboard edit** - CRUD products via UI
5. **Media upload** - Product images
6. **Stock management** - Inventory tracking

**P2 (Medium - Post-MVP):**
7. **Payment integration** - Viva Wallet
8. **Shipping integration** - ACS/ELTA
9. **Admin panel** - Product approval/override

---

## 🎯 DEFINITION OF DONE (Per Stage)

### Stage 2: Permissions Audit (NEXT)
- [ ] Read `backend/app/Policies/ProductPolicy.php`
- [ ] Verify `update()` checks `product.producer_id === user.producer_id`
- [ ] Run backend tests: `php artisan test --filter ProductPolicy`
- [ ] Check frontend dashboard: only own products visible
- [ ] Test admin override: admin can edit any product
- [ ] Document findings: `docs/FEATURES/PRODUCER-PERMISSIONS.md`
- [ ] All tests pass (no regressions)

**Exit Criteria:** No authorization bugs found, or bugs fixed + verified

### Stage 3: Dashboard Edit
- [ ] Producer can create product via `/producer/products/create`
- [ ] Producer can edit own product via `/producer/products/[id]/edit`
- [ ] Producer CANNOT edit other producer's products (403)
- [ ] Form validation works (name, price, stock)
- [ ] E2E test passes: create → edit → verify
- [ ] API responds correctly (201, 200, 403)

**Exit Criteria:** Working CRUD for own products only

### Stage 4: Checkout
- [ ] Customer can add product to cart (POST `/api/cart`)
- [ ] Cart persists across pages (session)
- [ ] Checkout creates order (POST `/api/orders`)
- [ ] Order visible in `/orders/[id]`
- [ ] Email confirmation sent (or logged in dev)
- [ ] Database has order + order_items records

**Exit Criteria:** End-to-end purchase flow works (no real payment)

---

## 📊 RISK MAP

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| ProductPolicy not enforcing ownership | HIGH | Audit + fix in Stage 2 | ⏳ NEXT |
| No product approval workflow | MEDIUM | Admin panel in P2 | ⏳ TODO |
| Cart data loss on session expire | LOW | Move to DB in future | Accepted |
| Payment integration complexity | HIGH | Use fake provider for MVP | Planned |
| Stock race conditions | MEDIUM | Add DB transactions | ⏳ TODO |

---

## 🔄 MAINTENANCE

**Update Frequency:** After each major feature completion

**Owners:**
- **Data model changes:** Backend team (update relationships)
- **Permission changes:** Security team (update matrix)
- **Execution order:** PM (update priorities)

**Related Docs:**
- `docs/OPS/STATE.md` - Current operational state
- `docs/NEXT-7D.md` - Short-term priorities
- `docs/FEATURES/PRODUCER-PERMISSIONS.md` - Permission audit (upcoming)
