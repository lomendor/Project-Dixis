# Dixis User Flows

**Last Updated**: December 2025 | **Version**: Post-Sprint 4

---

## Overview

This document maps the navigation paths and user journeys for the three main user roles in Dixis:
- **Consumer**: Browsing and purchasing products
- **Producer**: Managing products and orders
- **Admin**: System administration and approvals

---

## Consumer Journey

### Browse to Purchase Flow
```
Homepage (/)
    ↓
Product Catalog (/products)
    ↓ click product
Product Detail (/products/[id])
    ↓ add to cart
Shopping Cart (/cart)
    ↓ checkout
Checkout Form (/checkout)
    ↓ select payment method
Payment (/checkout/payment) [Viva Wallet or COD]
    ↓ complete
Thank You (/thank-you)
```

### Order Tracking Flow
```
Thank You page → receives order token
    ↓
Track Order (/orders/track/[token])
    ↓
Order Status & Details displayed
```

### Account Pages
- `/account/orders` - Order history
- `/account/orders/[orderId]` - Order details

---

## Producer Journey

### Onboarding Flow
```
Waitlist Signup (/producers/waitlist)
    ↓ submit application
Admin reviews → Approved/Rejected
    ↓ if approved
Onboarding (/producer/onboarding)
    ↓ complete setup
Dashboard (/producer/dashboard)
```

### Product Management Flow
```
Dashboard (/producer/dashboard)
    ↓
Product List (/my/products)
    ↓ add new
Create Product (/my/products/create)
    ↓ fill form + upload image
Product Created (pending approval)
    ↓ admin approves
Product Live on storefront
```

### Edit/Delete Product
```
Product List (/my/products)
    ↓ click edit
Edit Product (/my/products/[id]/edit)
    ↓ save changes
Updated

OR

Product List (/my/products)
    ↓ click delete
Confirmation Modal
    ↓ confirm
Product Removed
```

### Producer Order Management
```
Dashboard (/producer/dashboard)
    ↓
Orders List (/producer/orders)
    ↓
Order Detail (/producer/orders/[id])
```

### Producer Dashboard Features
- KPI cards (sales, orders, revenue)
- Top selling products
- Recent orders
- Low stock alerts

---

## Admin Journey

### Main Navigation
```
Admin Dashboard (/admin)
    ├── Producers (/admin/producers)
    ├── Products (/admin/products)
    ├── Orders (/admin/orders)
    └── Settings (/admin/settings)
```

### Producer Approval Flow
```
Admin Dashboard (/admin)
    ↓
Producers List (/admin/producers)
    ↓ filter by status: pending
See pending producers
    ↓ click Approve/Reject
If Approve: Producer activated
If Reject: Modal → enter reason → producer notified
```

### Product Approval Flow
```
Admin Dashboard (/admin)
    ↓
Products List (/admin/products)
    ↓ filter by approval: pending
See pending products
    ↓ click Approve/Reject
If Approve: Product goes live
If Reject: Modal → enter reason → producer notified
```

### Order Management
```
Orders List (/admin/orders)
    ↓
Order Detail (/admin/orders/[id])
    ├── View full order info
    ├── Update status (Packing, Shipped)
    └── Resend receipt email
```

### Admin Dashboard Features
- Order summary (today/week/month)
- Recent orders table
- Low stock alerts
- Revenue metrics

---

## Authentication

### Login Flow
```
Any protected page
    ↓ not authenticated
Redirect to Login (/auth/login)
    ↓ submit credentials
API validates via Sanctum
    ↓ success
Redirect to intended destination
```

### Registration Flow
```
Register Page (/auth/register)
    ↓ fill form (email, password, role)
API creates user
    ↓ auto-login
Redirect to appropriate dashboard
```

### Role Detection
- `AuthContext` provides current user + role
- `AuthGuard` component wraps protected routes
- Role-based rendering in Header component

---

## Page Inventory by Section

### Storefront (Public)
| Page | Path | Purpose |
|------|------|---------|
| Homepage | `/` | Landing + featured products |
| Products | `/products` | Product catalog with search |
| Product Detail | `/products/[id]` | Single product view |
| Cart | `/cart` | Shopping cart |
| Checkout | `/checkout` | Checkout form |
| Payment | `/checkout/payment` | Payment processing |
| Thank You | `/thank-you` | Order confirmation |
| Track Order | `/orders/track/[token]` | Order status |

### Producer (Protected)
| Page | Path | Purpose |
|------|------|---------|
| Dashboard | `/producer/dashboard` | KPIs + overview |
| Products | `/my/products` | Product list |
| Create | `/my/products/create` | New product form |
| Edit | `/my/products/[id]/edit` | Edit product |
| Orders | `/producer/orders` | Order list |
| Order Detail | `/producer/orders/[id]` | Order details |

### Admin (Protected)
| Page | Path | Purpose |
|------|------|---------|
| Dashboard | `/admin` | System overview |
| Producers | `/admin/producers` | Producer management |
| Products | `/admin/products` | Product approval |
| Orders | `/admin/orders` | Order management |
| Order Detail | `/admin/orders/[id]` | Order details |
| Settings | `/admin/settings` | System settings |

### Auth
| Page | Path | Purpose |
|------|------|---------|
| Login | `/auth/login` | User login |
| Register | `/auth/register` | User registration |

---

## Technical Notes

### Layout Structure
- Root layout (`/app/layout.tsx`): Header, Footer, Providers
- Storefront layout: Minimal wrapper
- Admin/Producer: Protected by AuthGuard

### State Management
- **Auth**: React Context (`AuthProvider`)
- **Cart**: React Context (`CartProvider`)
- **Toasts**: React Context (`ToastProvider`)

### API Patterns
- Consumer: Public endpoints, no auth
- Producer: Auth required, `/api/me/*` endpoints
- Admin: Auth + admin role, `/api/admin/*` endpoints
