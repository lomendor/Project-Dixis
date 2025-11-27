import { NextRequest, NextResponse } from 'next/server';
import { paymentManager } from '@/lib/payment-providers';

/**
 * POST /api/checkout/confirm
 * Confirms payment after redirect from Viva Wallet
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, vivaOrderCode, transactionId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Missing orderId' },
        { status: 400 }
      );
    }

    // Use vivaOrderCode as token for confirmation
    const token = vivaOrderCode?.toString() || transactionId;

    const result = await paymentManager.confirmPayment(orderId, token);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Payment confirmation failed',
      });
    }

    // In production: Update order status in database
    // For now: Return success with mock order number
    const orderNumber = `DX${Date.now().toString().slice(-8)}`;

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      transactionId: result.transactionId,
      message: 'Payment confirmed successfully',
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
