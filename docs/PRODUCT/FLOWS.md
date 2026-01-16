# Core User Flows — Dixis Marketplace

**Created**: 2026-01-17
**Pass**: PRD-AUDIT-STRUCTURE-01

> Documents the 5 core user journeys through the application.

---

## Flow 1: Browse & Search Products

**Actor**: Consumer (guest or authenticated)
**Goal**: Find products to purchase

### Steps

1. **Entry**: User lands on `/` or `/products`
2. **Search**: Type in search bar → results filter in real-time (FTS via PostgreSQL)
3. **Filter**: Select category from dropdown → products filtered
4. **Browse**: Scroll through product grid, paginate if needed
5. **Select**: Click product card → navigate to `/products/[id]`
6. **View**: See product details, price, producer info
7. **Exit**: Add to cart OR continue browsing

### Pages Involved
- `/` (home)
- `/products` (catalog)
- `/products/[id]` (PDP)

### Data Flow
```
User Input → Products API (/api/v1/public/products?q=...) → Product Grid
```

### E2E Coverage
- `products-search.spec.ts` — Search functionality
- `products-page.spec.ts` — Page load, product cards

---

## Flow 2: Add to Cart & Checkout

**Actor**: Consumer (guest or authenticated)
**Goal**: Purchase products

### Steps

1. **Add**: On PDP, click "Add to Cart" → toast confirmation
2. **View Cart**: Navigate to `/cart` → see items, quantities, subtotal
3. **Edit**: Adjust quantities or remove items
4. **Checkout**: Click "Proceed to Checkout" → navigate to `/checkout`
5. **Guest Notice**: If unauthenticated, show guest checkout notice
6. **Fill Form**: Enter name, phone, email (required for guests), address, city, postal code
7. **Payment**: Select payment method (COD or Card)
8. **Submit**: Click submit button
9. **Process**:
   - COD: Order created → redirect to `/thank-you?id={orderId}`
   - Card: Order created → redirect to Stripe Checkout → return to `/checkout/payment/success`

### Pages Involved
- `/products/[id]` (add to cart)
- `/cart` (view/edit)
- `/checkout` (form + submit)
- `/thank-you` or `/checkout/payment/success` (confirmation)

### Data Flow
```
Cart State (localStorage) → POST /api/v1/orders → Order Created → Confirmation
```

### E2E Coverage
- `cart-add-checkout.smoke.spec.ts` — Add to cart, checkout flow
- `checkout.spec.ts` — Form submission
- `guest-checkout.spec.ts` — Guest flow

---

## Flow 3: Order Confirmation & Tracking

**Actor**: Consumer (authenticated or with order token)
**Goal**: View order status and details

### Steps

1. **Receive**: After checkout, user sees confirmation page
2. **View Details**: Order number, items, shipping address, total
3. **Track**: Click "Track Order" → navigate to tracking page
4. **Check Status**: See order status (pending → processing → shipped → delivered)
5. **Return**: Click "Continue Shopping" → back to products

### Pages Involved
- `/order/confirmation/[orderId]` (detailed confirmation)
- `/thank-you` (simple confirmation)
- `/orders/track/[token]` (tracking)
- `/account/orders` (order history)
- `/account/orders/[orderId]` (order detail)

### Data Flow
```
Order ID → GET /api/orders/{id} → Order Details Display
```

### E2E Coverage
- `checkout-confirmation-route.spec.ts` — Confirmation page
- `i18n-checkout-orders.spec.ts` — i18n compliance

---

## Flow 4: Producer Manage Products

**Actor**: Producer (authenticated with producer role)
**Goal**: Add/edit products for sale

### Steps

1. **Login**: Producer logs in via `/auth/login` or `/producers/login`
2. **Dashboard**: Land on `/producer/dashboard` → see KPIs
3. **Products**: Navigate to `/producer/products` → see product list
4. **Create**: Click "Add Product" → navigate to `/producer/products/create`
5. **Fill Form**: Enter title, description, price, stock, images, category
6. **Submit**: Save product → redirect to products list
7. **Edit**: Click product → navigate to `/producer/products/[id]/edit` → update
8. **Verify**: Product appears in catalog (after admin approval if required)

### Pages Involved
- `/producer/dashboard` (overview)
- `/producer/products` (list)
- `/producer/products/create` (add)
- `/producer/products/[id]/edit` (edit)

### Data Flow
```
Form Input → POST/PUT /api/v1/producer/products → Product Saved
```

### E2E Coverage
- `producer-dashboard.spec.ts` — Dashboard access, i18n
- TBD: Product CRUD tests

---

## Flow 5: Producer Manage Orders

**Actor**: Producer (authenticated with producer role)
**Goal**: View and update orders containing their products

### Steps

1. **Login**: Producer authenticated
2. **Dashboard**: From dashboard, click "View Orders" or navigate to `/producer/orders`
3. **Filter**: Use status tabs (All, Pending, Processing, Shipped, Delivered)
4. **View**: See order cards with customer info, items, total
5. **Detail**: Click order → navigate to `/producer/orders/[id]`
6. **Update Status**: Click status button (e.g., "Mark as Shipped")
7. **Confirm**: Status updated, UI reflects change

### Pages Involved
- `/producer/orders` (list with filters)
- `/producer/orders/[id]` (detail with actions)

### Data Flow
```
GET /api/v1/producer/orders → Order List
PUT /api/v1/producer/orders/{id}/status → Status Update
```

### E2E Coverage
- `i18n-checkout-orders.spec.ts` — Producer orders i18n
- `producer-analytics.spec.ts` — Related producer tests

---

## Summary: Flow Coverage

| Flow | Pages | E2E Tests | i18n |
|------|-------|-----------|------|
| Browse/Search | 3 | ✅ Yes | ✅ Yes |
| Add to Cart/Checkout | 4 | ✅ Yes | ✅ Yes |
| Order Confirmation | 5 | ✅ Yes | ✅ Yes |
| Producer Manage Products | 4 | Partial | Partial |
| Producer Manage Orders | 2 | ✅ Yes | ✅ Yes |

---

_Lines: ~140 | Last Updated: 2026-01-17_
