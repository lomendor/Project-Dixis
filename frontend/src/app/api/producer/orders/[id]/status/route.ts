import { NextRequest, NextResponse } from 'next/server'
import { sendOrderStatusUpdate } from '@/lib/email'
import { requireProducer } from '@/lib/auth/requireProducer'
import { prisma } from '@/lib/db/client'

/**
 * POST /api/producer/orders/[id]/status
 *
 * Sends email notification for order status change.
 *
 * SECURITY:
 * - Requires authenticated producer session (cookie-based JWT)
 * - Verifies producer owns at least one item in the order
 * - Customer email is fetched from trusted order data, not request body
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let producer;
  try {
    producer = await requireProducer();
  } catch (response) {
    // requireProducer throws Response on auth failure
    if (response instanceof Response) {
      return response;
    }
    return NextResponse.json(
      { success: false, message: 'Απαιτείται είσοδος' },
      { status: 401 }
    );
  }

  try {
    const { id: orderId } = await params;

    // Validate order ID format
    if (!orderId || typeof orderId !== 'string' || orderId.length < 1) {
      return NextResponse.json(
        { success: false, message: 'Invalid order ID' },
        { status: 400 }
      );
    }

    // Parse request body - only accept status, nothing else
    const body = await request.json();
    const { status } = body;

    if (!status || !['processing', 'shipped', 'delivered'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      );
    }

    // Fetch order with ownership verification
    // Producer must have at least one item in this order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        email: true,
        name: true,
        buyerName: true,
        total: true,
        items: {
          where: { producerId: producer.id },
          select: { id: true }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Η παραγγελία δεν βρέθηκε' },
        { status: 404 }
      );
    }

    // Ownership check: producer must have items in this order
    if (!order.items || order.items.length === 0) {
      console.warn(`[API] Producer ${producer.id} attempted to access order ${orderId} without ownership`);
      return NextResponse.json(
        { success: false, message: 'Δεν έχετε πρόσβαση σε αυτή την παραγγελία' },
        { status: 403 }
      );
    }

    // Get customer email from trusted order data, NOT from request body
    const customerEmail = order.email;
    if (!customerEmail) {
      return NextResponse.json(
        { success: false, message: 'Δεν βρέθηκε email πελάτη στην παραγγελία' },
        { status: 400 }
      );
    }

    // Get customer name from trusted order data
    const customerName = order.name || order.buyerName || 'Πελάτη';

    // Send email notification
    const emailResult = await sendOrderStatusUpdate({
      data: {
        orderId: orderId,
        customerName,
        newStatus: status,
        total: order.total,
      },
      toEmail: customerEmail,
    });

    return NextResponse.json({
      success: emailResult.ok,
      dryRun: emailResult.dryRun,
      error: emailResult.error,
      message: emailResult.ok
        ? (emailResult.dryRun ? 'Email skipped (dry-run mode)' : 'Email sent successfully')
        : 'Email failed to send',
    });

  } catch (error) {
    console.error('[API] Email notification error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send email notification' },
      { status: 500 }
    );
  }
}
