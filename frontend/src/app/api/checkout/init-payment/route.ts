/**
 * DEPRECATED: Legacy Viva Wallet payment initialization endpoint.
 * Payments are now initialized via Laravel backend (Stripe).
 * Returns 410 Gone to prevent accidental usage.
 */
import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'This endpoint has been deprecated.',
      message: 'Payment initialization now uses Laravel API exclusively.',
      redirect: 'Use paymentApi.initPayment() which calls Laravel backend',
    },
    { status: 410 }
  )
}
