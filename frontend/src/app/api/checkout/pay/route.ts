/**
 * DEPRECATED: Legacy payment processing endpoint with mock data.
 * Order creation and payment now go through Laravel API exclusively.
 * Returns 410 Gone to prevent accidental usage.
 */
import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'This endpoint has been deprecated.',
      message: 'Payment processing now uses Laravel API exclusively.',
      redirect: 'Use apiClient.createOrder() + paymentApi for payments',
    },
    { status: 410 }
  )
}
