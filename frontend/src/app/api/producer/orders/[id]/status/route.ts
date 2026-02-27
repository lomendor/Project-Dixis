import { NextRequest, NextResponse } from 'next/server'
import { sendOrderStatusUpdate } from '@/lib/email'
import { verifySanctumProducer } from '@/lib/auth/verifySanctumProducer'

/**
 * POST /api/producer/orders/[id]/status
 *
 * Sends email notification for order status change.
 *
 * FIX-EMAIL-01: Removed Prisma dependency.
 * Orders live in Laravel/PostgreSQL — Prisma has no access to them.
 * Instead, the client passes order data from the Laravel API response.
 *
 * FIX-PRODUCER-AUTH-01: Uses verifySanctumProducer() — shared Sanctum cookie forwarding.
 * Producer auth uses Sanctum session cookies (not dixis_jwt), so the old requireProducer()
 * always returned 401.
 *
 * SECURITY:
 * - Verifies producer session via Laravel Sanctum (cookie forwarding)
 * - The status update itself is done via Laravel API (not here)
 *   This route ONLY sends the email notification
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifySanctumProducer();
  if (auth.ok === false) return auth.response;

  try {
    const { id: orderId } = await params;

    // Validate order ID format
    if (!orderId || typeof orderId !== 'string' || orderId.length < 1) {
      return NextResponse.json(
        { success: false, message: 'Invalid order ID' },
        { status: 400 }
      );
    }

    // Parse request body — data comes from the page component
    // which already fetched it from the Laravel API
    const body = await request.json();
    const { status, customerEmail, customerName, total } = body;

    if (!status || !['processing', 'shipped', 'delivered'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      );
    }

    if (!customerEmail) {
      return NextResponse.json(
        { success: false, message: 'Δεν βρέθηκε email πελάτη' },
        { status: 400 }
      );
    }

    // Send email notification via Resend
    const emailResult = await sendOrderStatusUpdate({
      data: {
        orderId,
        customerName: customerName || 'Πελάτη',
        newStatus: status,
        total: typeof total === 'string' ? parseFloat(total) : (total || 0),
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
