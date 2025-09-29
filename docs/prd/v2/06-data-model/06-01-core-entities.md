---
title: PRD v2 — Δεδομένα: Πυρήνας
last_updated: 2025-09-29
source: "PRD/PRD Dixis Τελικό .docx.md (§2.4.1)"
---

# Πυρήνας Οντοτήτων

## Users
- id, email (unique), password (hashed), name, phone, role (consumer/producer/admin), email_verified_at, remember_token, created_at, updated_at.

## Producers
- id, user_id, business_name, tax_id, tax_office, description, address, city, postal_code, region, logo, cover_image, website, social_media (JSON), bio, verified, rating, timestamps.

## Products
- id, producer_id, name, slug, description, short_description, price, discount_price, stock, sku, weight, dimensions (JSON), main_image, is_active, is_featured, is_seasonal, season_start/end, is_limited_edition, limited_quantity, allow_wishlist_notifications, timestamps.

## Product_Images
- id, product_id, image_path, sort_order, alt_text, timestamps.

## Categories & Relations
- Product_Categories: id, name, slug, parent_id, description, image, is_active, timestamps.
- Product_Category_Relations: id, product_id, category_id, timestamps.

## Orders & Order_Items
- Orders: id, user_id, business_id?, status, total_amount, shipping_cost, tax_amount, discount_amount, shipping_address_id, billing_address_id, payment_method, payment_status, notes, timestamps.
- Order_Items: id, order_id, product_id, producer_id, quantity, price, subtotal, timestamps.

## Reviews
- id, user_id, product_id, order_id, rating (1-5), title, comment, is_verified, is_approved, timestamps.

## Addresses
- id, user_id, name, address_line_1/2, city, postal_code, region, country, phone, is_default_shipping, is_default_billing, timestamps.

