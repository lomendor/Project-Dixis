/**
 * DEPRECATED: Legacy Viva Wallet payment confirmation endpoint.
 * Payments are now confirmed via Laravel backend (Stripe).
 * Returns 410 Gone to prevent accidental usage.
 */
import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'This endpoint has been deprecated.',
      message: 'Payment confirmation now uses Laravel API exclusively.',
      redirect: 'Use paymentApi.confirmPayment() which calls Laravel backend',
    },
    { status: 410 }
  )
}
