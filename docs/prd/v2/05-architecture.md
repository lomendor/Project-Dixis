---
title: PRD v2 — Αρχιτεκτονική
last_updated: 2025-09-29
source: "PRD/PRD Dixis Τελικό .docx.md"
---

# Αρχιτεκτονική

## 2.1 Τεχνολογικό Stack
- Backend: Laravel 10.x (PHP 8+), Laravel Sanctum για auth.
- Frontend: Next.js (React), SSR/SEO-friendly.
- Database: MySQL 8.0.
- Cache: Redis 7.
- Containers: Docker & Docker Compose.

## 2.2 Ασφάλεια
- SSL/TLS (HTTPS), GDPR συμμόρφωση.
- Auth: Laravel Sanctum tokens.
- Πληρωμές: Stripe/PayPal (PCI-DSS compliant).
- Τακτικοί έλεγχοι ασφαλείας, penetration tests.
- Ημερήσια backups βάσης.

## 2.3 Απόδοση
- Χρόνος φόρτωσης < 3s σε 4G.
- Uptime 99.9%.
- Mobile-first responsive.
- SSR (Next.js) για καλύτερο SEO/ταχύτητα.
