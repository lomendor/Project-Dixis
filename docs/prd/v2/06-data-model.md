---
title: PRD v2 — Μοντέλο Δεδομένων
last_updated: 2025-09-25
---

# Μοντέλο Δεδομένων

Οντότητες (ενδεικτικά):
- Product: id, τίτλος, τιμή, κατηγορίες.
- CartItem: productId, qty, unitPrice, totals.
- Order: items, shipping, σύνολα, κατάσταση.

Κανόνες:
- Υπολογισμοί φόρων/μεταφορικών στον server, deterministic αποτελέσματα.

