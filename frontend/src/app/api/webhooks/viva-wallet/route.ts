import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import crypto from 'crypto';

/**
 * Viva Wallet Webhook Handler
 * Receives payment status updates from Viva Wallet
 *
 * Event Types:
 * - 1796: Transaction Payment Created (successful payment)
 * - 1797: Transaction Failed
 * - 1798: Transaction Reversed (refund)
 */

interface VivaWebhookPayload {
  EventTypeId: number;
  Meid: string;
  OrderCode: string;
  TransactionId: string;
  Amount: number;
  StatusId: string;
  FullName?: string;
  Email?: string;
  Phone?: string;
  TargetPersonId?: string;
  TargetWalletId?: string;
  BankId?: string;
  Loyalty?: string;
  EventData?: Record<string, unknown>;
}

// Verify Viva webhook signature
function verifyVivaSignature(
  payload: string,
  signature: string | null
): boolean {
  if (!signature) return false;

  const verificationKey = process.env.VIVA_WALLET_VERIFICATION_KEY;
  if (!verificationKey) {
    console.warn('VIVA_WALLET_VERIFICATION_KEY not set, skipping signature verification');
    return true; // Allow in dev mode
  }

  const expectedSignature = crypto
    .createHmac('sha256', verificationKey)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Map Viva event to payment status
function mapEventToStatus(eventTypeId: number): string {
  switch (eventTypeId) {
    case 1796: return 'paid';
    case 1797: return 'failed';
    case 1798: return 'refunded';
    default: return 'pending';
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-viva-signature');

    // Verify signature in production
    if (process.env.NODE_ENV === 'production') {
      if (!verifyVivaSignature(rawBody, signature)) {
        console.error('Invalid Viva webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    const payload: VivaWebhookPayload = JSON.parse(rawBody);
    const { EventTypeId, OrderCode } = payload;

    console.log(`[Viva Webhook] Event ${EventTypeId} for order ${OrderCode}`);

    // Find the order by Viva order code (stored in publicToken or via localStorage mapping)
    // Note: OrderCode should be stored when creating payment intent
    // For now, we'll try to match via recent pending orders if exact match fails
    let order = await prisma.order.findFirst({
      where: {
        publicToken: OrderCode,
      },
    });

    // If not found by publicToken, try to find by status and recent creation
    if (!order) {
      // Log for debugging but don't fail - Viva might send webhooks for test transactions
      console.warn(`[Viva Webhook] Order not found for code: ${OrderCode}`);
      return NextResponse.json({ received: true, warning: 'Order not found' });
    }

    // Update order status based on event
    const newStatus = mapEventToStatus(EventTypeId);

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
    });

    console.log(`[Viva Webhook] Order ${order.id} updated to ${newStatus}`);

    // Send notification email on successful payment
    if (EventTypeId === 1796 && order.email) {
      try {
        // Trigger email notification (async, don't wait)
        fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/jobs/send-order-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id, type: 'payment_confirmed' }),
        }).catch(() => {});
      } catch {
        // Non-blocking, log and continue
        console.warn('[Viva Webhook] Failed to trigger email for order', order.id);
      }
    }

    return NextResponse.json({ received: true, orderId: order.id });
  } catch (error) {
    console.error('[Viva Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Viva sends a GET request to verify the webhook URL
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: 'ok', service: 'viva-wallet-webhook' });
}
