# Page Inventory — Dixis Marketplace

**Created**: 2026-01-17
**Pass**: PRD-AUDIT-STRUCTURE-01

> Authoritative list of all core pages, their purpose, and content contracts.

---

## Storefront (Consumer-Facing)

### `/` — Home
- **Purpose**: Landing page with hero, search, featured products
- **Sections**: Hero banner, Search bar, Featured products grid
- **Data deps**: Products API (featured), Categories
- **i18n**: `home.*`, `nav.*`

### `/products` — Product Catalog
- **Purpose**: Browse/search all products
- **Sections**: Search input, Category filter, Product grid, Pagination
- **Data deps**: Products API (paginated, filterable)
- **i18n**: `products.*`, `common.*`

### `/products/[id]` — Product Detail (PDP)
- **Purpose**: View single product, add to cart
- **Sections**: Image gallery, Title/price, Description, Add to cart button, Producer info
- **Data deps**: Product by ID, Producer by ID
- **i18n**: `product.*`

### `/producers` — Producers List
- **Purpose**: Browse all producers
- **Sections**: Producer cards grid
- **Data deps**: Producers API
- **i18n**: `producers.*`

### `/cart` — Shopping Cart
- **Purpose**: View/edit cart before checkout
- **Sections**: Cart items list, Quantity controls, Subtotal, Checkout button
- **Data deps**: LocalStorage cart state
- **i18n**: `cart.*`

### `/checkout` — Checkout Flow
- **Purpose**: Enter shipping details, select payment, place order
- **Sections**: Order summary, Shipping form (name, phone, email, address), Payment method selector, Submit button
- **Data deps**: Cart state, Orders API (POST)
- **i18n**: `checkout.*`, `checkoutPage.*`, `form.*`, `shipping.*`

### `/thank-you` — Order Confirmation (COD)
- **Purpose**: Show order success after COD checkout
- **Sections**: Success message, Order ID, Continue shopping link
- **Data deps**: Order ID from query param
- **i18n**: `order.success.*`

### `/order/confirmation/[orderId]` — Order Confirmation (Detailed)
- **Purpose**: Detailed order confirmation with shipping/items
- **Sections**: Success header, Order details, Items list, Shipping address, Action buttons
- **Data deps**: Orders API (GET by ID)
- **i18n**: `orderConfirmation.*`, `orderStatus.*`

### `/orders/track/[token]` — Order Tracking
- **Purpose**: Track order status by token
- **Sections**: Order status timeline, Shipping info
- **Data deps**: Order tracking API
- **i18n**: TBD

---

## Account (Authenticated Consumer)

### `/auth/login` — Login
- **Purpose**: Consumer authentication
- **Sections**: Email/password form, Register link
- **Data deps**: Auth API
- **i18n**: `auth.login.*`

### `/auth/register` — Register
- **Purpose**: Consumer account creation
- **Sections**: Registration form
- **Data deps**: Auth API
- **i18n**: `auth.register.*`

### `/account/orders` — My Orders
- **Purpose**: View order history
- **Sections**: Orders list, Status badges
- **Data deps**: Orders API (user's orders)
- **i18n**: `nav.myOrders`, `orderStatus.*`

### `/account/orders/[orderId]` — Order Detail
- **Purpose**: View single order details
- **Sections**: Order info, Items, Status, Shipping
- **Data deps**: Orders API (by ID)
- **i18n**: `orderConfirmation.*`

### `/account/notifications` — Notifications
- **Purpose**: View all notifications
- **Sections**: Notification list, Read/unread filter
- **Data deps**: Notifications API
- **i18n**: `notifications.*`

---

## Producer Portal (Authenticated Producer)

### `/producer/dashboard` — Producer Dashboard
- **Purpose**: Overview of producer business
- **Sections**: KPI cards (orders, revenue, products), Top products, Quick actions
- **Data deps**: Producer Dashboard API
- **i18n**: `producerDashboard.*`

### `/producer/products` — Manage Products
- **Purpose**: List producer's products
- **Sections**: Products table, Add product button
- **Data deps**: Producer Products API
- **i18n**: TBD

### `/producer/products/create` — Create Product
- **Purpose**: Add new product
- **Sections**: Product form (title, price, description, images)
- **Data deps**: Products API (POST)
- **i18n**: TBD

### `/producer/products/[id]/edit` — Edit Product
- **Purpose**: Edit existing product
- **Sections**: Product form (pre-filled)
- **Data deps**: Products API (GET/PUT)
- **i18n**: TBD

### `/producer/orders` — Producer Orders
- **Purpose**: View orders containing producer's products
- **Sections**: Status filter tabs, Order cards, Order items
- **Data deps**: Producer Orders API
- **i18n**: `producerOrders.*`, `orderStatus.*`

### `/producer/orders/[id]` — Producer Order Detail
- **Purpose**: View single order detail, update status
- **Sections**: Order info, Customer info, Items, Status update buttons
- **Data deps**: Producer Orders API
- **i18n**: TBD

### `/producer/settings` — Producer Settings
- **Purpose**: Manage producer profile
- **Sections**: Profile form, Shop settings
- **Data deps**: Producer Profile API
- **i18n**: TBD

### `/producer/analytics` — Producer Analytics
- **Purpose**: Sales/performance analytics
- **Sections**: Charts (sales, orders, products)
- **Data deps**: Producer Analytics API
- **i18n**: TBD

### `/producer/onboarding` — Producer Onboarding
- **Purpose**: New producer setup wizard
- **Sections**: Multi-step form
- **Data deps**: Producer Profile API
- **i18n**: TBD

---

## Admin Panel

### `/admin` — Admin Dashboard
- **Purpose**: Overview of platform metrics
- **Sections**: KPI cards, Recent activity
- **Data deps**: Admin Dashboard API
- **i18n**: TBD

### `/admin/orders` — Manage Orders
- **Purpose**: View/manage all orders
- **Sections**: Orders table, Filters, Status update
- **Data deps**: Admin Orders API
- **i18n**: TBD

### `/admin/orders/[id]` — Admin Order Detail
- **Purpose**: View/edit single order
- **Sections**: Order details, Status controls
- **Data deps**: Admin Orders API
- **i18n**: TBD

### `/admin/products` — Manage Products
- **Purpose**: View/approve all products
- **Sections**: Products table, Approval actions
- **Data deps**: Admin Products API
- **i18n**: TBD

### `/admin/products/moderation` — Product Moderation Queue
- **Purpose**: Review pending products
- **Sections**: Moderation queue, Approve/reject buttons
- **Data deps**: Admin Products API
- **i18n**: TBD

### `/admin/producers` — Manage Producers
- **Purpose**: View/approve producers
- **Sections**: Producers table, Approval actions
- **Data deps**: Admin Producers API
- **i18n**: TBD

### `/admin/users` — Manage Users
- **Purpose**: View/manage all users
- **Sections**: Users table, Role management
- **Data deps**: Admin Users API
- **i18n**: TBD

### `/admin/categories` — Manage Categories
- **Purpose**: CRUD for product categories
- **Sections**: Categories list, Add/edit forms
- **Data deps**: Categories API
- **i18n**: TBD

### `/admin/analytics` — Platform Analytics
- **Purpose**: Platform-wide analytics
- **Sections**: Charts, Metrics
- **Data deps**: Admin Analytics API
- **i18n**: TBD

### `/admin/settings` — Admin Settings
- **Purpose**: Platform configuration
- **Sections**: Settings forms
- **Data deps**: Admin Settings API
- **i18n**: TBD

---

## Static/Legal

### `/contact` — Contact Form
- **Purpose**: Contact submission
- **Sections**: Contact form
- **i18n**: TBD

### `/legal/terms` — Terms of Service
- **Purpose**: Legal terms
- **i18n**: TBD

### `/legal/privacy` — Privacy Policy
- **Purpose**: Privacy policy
- **i18n**: TBD

---

## Dev/Test Pages (Not Production)

- `/dev-check`, `/dev/*`, `/test-error`, `/ops/*`, `/products-demo`, `/demo-products`

---

## i18n Coverage Summary

| Namespace | Coverage |
|-----------|----------|
| `nav.*` | ✅ Complete |
| `home.*` | ✅ Complete |
| `common.*` | ✅ Complete |
| `cart.*` | ✅ Complete |
| `checkout.*` | ✅ Complete |
| `checkoutPage.*` | ✅ Complete |
| `product.*` | ✅ Complete |
| `products.*` | ✅ Complete |
| `producers.*` | ✅ Complete |
| `auth.*` | ✅ Complete |
| `notifications.*` | ✅ Complete |
| `producerDashboard.*` | ✅ Complete |
| `producerOrders.*` | ✅ Complete |
| `orderConfirmation.*` | ✅ Complete |
| `orderStatus.*` | ✅ Complete |
| `language.*` | ✅ Complete |
| Producer CRUD pages | TBD |
| Admin pages | TBD |

---

_Lines: ~220 | Last Updated: 2026-01-17_
