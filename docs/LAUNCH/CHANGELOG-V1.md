# Changelog V1

**Release Date:** 2026-01-21
**Version:** 1.0.0
**URL:** https://dixis.gr

---

## Consumers

- **Product Catalog:** Browse products from local Greek producers with search and filtering
- **Shopping Cart:** Add products to cart, update quantities, and review before checkout
- **Cart Sync:** Cart automatically syncs across devices when logged in (Pass CART-SYNC-01)
- **Guest Checkout:** Order as guest with cash on delivery (COD)
- **Card Payment:** Secure payments via Stripe (card, Klarna, Bancontact, EPS, Link)
- **Order Tracking:** View order status and history in your account
- **Email Notifications:** Receive confirmation emails for orders and status updates
- **Mobile-Friendly:** Responsive design works on all devices

## Producers

- **Producer Dashboard:** Overview of orders, revenue, and product performance
- **Product Management:** Add, edit, and toggle product availability
- **Order Management:** View and manage incoming orders
- **Quick Actions:** Fast access to common tasks from dashboard
- **Producer Profile:** Business information visible to consumers
- **Role-Based Access:** Secure access with AuthGuard protection on all producer pages

## Admin

- **Admin Dashboard:** Overview of platform activity, orders, and users
- **Order Management:** View all orders and update statuses (pending, processing, shipped, completed)
- **User Management:** View registered users and roles
- **Product Oversight:** Monitor products across all producers
- **Producer Management:** View and manage producer accounts

## Reliability & Security

- **Authentication Rate Limiting:** Protection against brute-force attacks (Pass SEC-AUTH-RL-02)
- **UTF-8 Email Encoding:** Greek characters display correctly in all emails (Pass EMAIL-UTF8-01)
- **E2E Test Suite:** 26+ comprehensive Playwright tests covering all critical flows
- **QA Verification:** All 4 core flows verified working in production (Pass V1-QA-EXECUTE-01)
  - Guest checkout (COD)
  - User checkout (Card)
  - Producer add product
  - Admin order status update
- **Performance:** <300ms TTFB on all public pages
- **Uptime Monitoring:** Automated health checks every 15 minutes
- **CI/CD Pipeline:** Automated testing and deployment with GitHub Actions

---

## Technical Stack

- **Backend:** Laravel 11.45.2 + PHP 8.2
- **Frontend:** Next.js 15.5.0 + React 19 + TypeScript 5
- **Database:** PostgreSQL 15
- **Payments:** Stripe
- **Email:** Resend
- **Hosting:** Production deployment on dedicated infrastructure

---

_Changelog: V1 | Created: 2026-01-21_
