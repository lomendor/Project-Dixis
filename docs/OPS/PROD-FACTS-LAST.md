# PROD FACTS (LAST)

**Date**: 2025-12-23 00:35 UTC

## Endpoints Status
- healthz=200 ✅
- api_products=200 ✅
- api_product_1=200 ✅
- products_list=200 ✅
- product_1_page=200 ✅
- login=307 (redirect to /auth/login) ✅
- register=307 (redirect to /auth/register) ✅
- auth_login=200 ✅
- auth_register=200 ✅

## Content Verification
- API Product 1: Contains "Organic Tomatoes" JSON data ✅
- Product detail page: Renders "Organic Tomatoes" with full details ✅
- NO "Σφάλμα φόρτωσης προϊόντος" error text ✅
- Products list: Shows product cards ✅

## Infrastructure
- Backend API: Laravel systemd service running (dixis-backend.service)
- Frontend: Next.js systemd service running (dixis-frontend-launcher.service)
- Canonical redirect: www → apex (301 permanent, clean URLs)
- Cart localStorage: Working across www/apex domains

## Notes
All core user journeys functional:
- Browse products ✅
- View product details ✅
- API endpoints healthy ✅
- Auth pages accessible ✅
