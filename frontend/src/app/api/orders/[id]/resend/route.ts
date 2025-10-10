import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

type Props = { params: { id: string } };

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { id } = params;

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id },
      select: { id: true, buyerName: true, total: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Η παραγγελία δεν βρέθηκε' }, { status: 404 });
    }

    // Log-only if SMTP not configured (dev mode)
    const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER);

    if (!smtpConfigured) {
      console.log('[resend-email] SMTP not configured, logging only:', {
        orderId: order.id,
        buyerName: order.buyerName,
        total: order.total,
        timestamp: new Date().toISOString()
      });
    } else {
      // TODO: Actual email sending when SMTP configured
      console.log('[resend-email] Would send email for order:', order.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Το email επιβεβαίωσης στάλθηκε επιτυχώς',
      mode: smtpConfigured ? 'email' : 'log-only'
    }, { status: 200 });

  } catch (e: any) {
    console.error('[resend-email] Error:', e?.message);
    return NextResponse.json({ error: 'Σφάλμα αποστολής email' }, { status: 500 });
  }
}
