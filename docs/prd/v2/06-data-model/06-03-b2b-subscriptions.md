---
title: PRD v2 — Δεδομένα: B2B & Συνδρομές
last_updated: 2025-09-29
source: "PRD/PRD Dixis Τελικό .docx.md (§2.4.3)"
---

# B2B & Συνδρομές

## Businesses
- id, user_id, name, business_type, tax_id, tax_office, address, city, postal_code, phone, email, website, logo, description, contact_person, verified, timestamps.

## Subscriptions
- id, subscriber_id, subscriber_type (business/producer), plan_id, status, start_date, end_date, auto_renew, payment_method, payment_details (JSON), timestamps.

## Subscription_Plans
- id, name, target_type, price, billing_cycle, commission_rate, features (JSON), is_active, timestamps.

