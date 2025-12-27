/**
 * Pass 44: Architecture Reconciliation - DISABLED ENDPOINT
 *
 * This legacy route previously created orders in Prisma/Neon (split-brain).
 * As of Pass 44, all order creation goes through Laravel API exclusively.
 *
 * Single Source of Truth: Laravel API + Laravel PostgreSQL
 * - Checkout uses apiClient.createOrder() → POST /api/v1/public/orders
 * - Orders UI reads from Laravel API → GET /api/v1/public/orders
 *
 * This endpoint returns 410 Gone to prevent accidental usage.
 *
 * @see docs/AGENT/SYSTEM/sources-of-truth.md
 */
import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'This endpoint has been deprecated (Pass 44).',
      message: 'Order creation now uses Laravel API exclusively.',
      redirect: 'Use apiClient.createOrder() which calls POST /api/v1/public/orders',
      docs: 'See docs/AGENT/SYSTEM/sources-of-truth.md for architecture details',
    },
    { status: 410 } // 410 Gone - resource permanently removed
  )
}

export async function GET() {
  return NextResponse.json(
    {
      error: 'This endpoint has been deprecated (Pass 44).',
      message: 'Order creation now uses Laravel API exclusively.',
    },
    { status: 410 }
  )
}
