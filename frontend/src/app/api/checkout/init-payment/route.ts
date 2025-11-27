import { NextRequest, NextResponse } from 'next/server';
import { paymentManager } from '@/lib/payment-providers';

/**
 * POST /api/checkout/init-payment
 * Initializes a payment session and returns redirect URL for Viva
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amountCents } = body;

    if (!orderId || !amountCents) {
      return NextResponse.json(
        { error: 'Missing orderId or amountCents' },
        { status: 400 }
      );
    }

    const result = await paymentManager.initPayment(orderId, amountCents, 'EUR');

    return NextResponse.json({
      success: true,
      redirectUrl: result.redirectUrl,
      clientSecret: result.clientSecret,
      vivaOrderCode: result.metadata?.vivaOrderCode,
    });

  } catch (error) {
    console.error('Init payment error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment init failed' },
      { status: 500 }
    );
  }
}
