# Pass GUEST-CHECKOUT-01 — Guest Checkout

**When**: 2026-01-16

## Goal

Enable guest checkout: users can purchase without creating an account.

## Why

- PRD requirement: "Allow purchase without account"
- Reduces friction for first-time buyers
- Critical for conversion rate (many users abandon at registration)

## How

1. **Audit** revealed backend already supports guest checkout:
   - `auth.optional` middleware on POST /orders
   - `OrderPolicy::create()` returns `true` for `$user = null`
   - `user_id` nullable in Order model
   - Email extracted from `shipping_address['email']`

2. **Frontend changes** (minimal):
   - Import `useAuth` to detect guest status
   - Add guest checkout notice banner
   - Make email field required for guests (for order confirmation)
   - Pre-fill email from user context if logged in

3. **E2E tests**:
   - Guest checkout happy path with COD
   - Email validation for guests
   - Guard test: auth-protected pages still require login

## Definition of Done

- [x] Checkout page accessible without login (guest)
- [x] Guest can enter shipping details + proceed to payment
- [x] Order created with guest email in `shipping_address`
- [x] Email confirmation supported via `OrderEmailService`
- [x] Playwright E2E: guest checkout happy path
- [x] Guard test: auth-required pages still require auth
- [x] TASKS + SUMMARY + STATE + NEXT-7D updated

## PRs

| PR | Title | Status |
|----|-------|--------|
| #2232 | feat: Pass GUEST-CHECKOUT-01 guest checkout | MERGED |
| #2233 | fix: E2E URL pattern for CI | PENDING |
