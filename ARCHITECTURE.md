# Architecture

## Overview
- **Frontend:** Next.js (prod build), port **3001**
- **API:** Laravel, base **http://127.0.0.1:8001/api/v1**
- **DB:** PostgreSQL (dev/testing/CI)
- **E2E:** Playwright (production-like builds)

## Contracts
- FE ↔ API: JSON over HTTP, auth via cookies/session (TBD token if needed)
- Env:
  - `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8001/api/v1`
  - `.env.testing` points to PostgreSQL (seeded)

## Core Flows
1. **Search/List** → `/products?query=&category=&minPrice=&maxPrice=`
2. **PDP** → `/products/{id}`
3. **Cart** → client state + API price validation
4. **Shipping Quote** → `/shipping/quote` (input: ZIP/City/Weight/Volume)
5. **Checkout (MVP)** → `POST /orders` (COD/unpaid) → confirmation

## Ports & Processes
- API: **8001**
- FE: **3001**
- CI: wait until both are ready before E2E

## Invariants
- PostgreSQL only
- Idempotent migrations & seeders (E2ESeeder includes **Greek** products)
- Stable selectors for E2E (no text that drifts)