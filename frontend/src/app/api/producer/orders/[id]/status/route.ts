import { NextRequest, NextResponse } from 'next/server'
import { sendOrderStatusUpdate } from '@/lib/email'

/**
 * POST /api/producer/orders/[id]/status
 *
 * Sends email notification for order status change.
 * The actual status update is done by the client calling the backend directly.
 * This route only handles the email notification (which needs server-side env vars).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const orderId = parseInt(id, 10)

    if (isNaN(orderId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid order ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status, customerName, customerEmail, total } = body

    if (!status || !['processing', 'shipped', 'delivered'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      )
    }

    if (!customerEmail) {
      return NextResponse.json(
        { success: false, message: 'Customer email required' },
        { status: 400 }
      )
    }

    // Send email notification
    const emailResult = await sendOrderStatusUpdate({
      data: {
        orderId,
        customerName: customerName || 'Πελάτη',
        newStatus: status,
        total: parseFloat(total || '0'),
      },
      toEmail: customerEmail,
    })

    return NextResponse.json({
      success: emailResult.ok,
      dryRun: emailResult.dryRun,
      error: emailResult.error,
    })

  } catch (error) {
    console.error('[API] Email notification error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send email notification' },
      { status: 500 }
    )
  }
}
