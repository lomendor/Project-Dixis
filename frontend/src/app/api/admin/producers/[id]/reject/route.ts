import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin'

const RejectSchema = z.object({
  rejectionReason: z.string().min(5, 'Ο λόγος απόρριψης πρέπει να έχει τουλάχιστον 5 χαρακτήρες')
})

/**
 * POST /api/admin/producers/[id]/reject
 * Rejects a producer (sets approvalStatus to 'rejected')
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Απαιτείται σύνδεση διαχειριστή' }, { status: 403 })
  }

  try {
    const { id: producerId } = await params

    if (!producerId) {
      return NextResponse.json({ error: 'Invalid producer ID' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const parsed = RejectSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Λάθος δεδομένα' },
        { status: 400 }
      )
    }

    const producer = await prisma.producer.update({
      where: { id: producerId },
      data: {
        approvalStatus: 'rejected',
        isActive: false,
        rejectionReason: parsed.data.rejectionReason
      },
      select: {
        id: true,
        name: true,
        approvalStatus: true,
        isActive: true,
        rejectionReason: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Ο παραγωγός απορρίφθηκε',
      producer
    })

  } catch (error: any) {
    console.error('Producer rejection error:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Ο παραγωγός δεν βρέθηκε' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Σφάλμα διακομιστή' },
      { status: 500 }
    )
  }
}
