import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { requireAdmin, AdminError } from '@/lib/auth/admin'
import { logAdminAction, createRejectionContext } from '@/lib/audit/logger'
import { z } from 'zod'

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
    // Get admin context for audit logging
    const admin = await requireAdmin()
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

    // Fetch existing producer for audit log (oldValue)
    const existingProducer = await prisma.producer.findUnique({
      where: { id: producerId },
      select: { id: true, name: true, approvalStatus: true, isActive: true }
    })

    if (!existingProducer) {
      return NextResponse.json({ error: 'Ο παραγωγός δεν βρέθηκε' }, { status: 404 })
    }

    // Update producer
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

    // Audit log with rejection reason
    await logAdminAction({
      admin,
      action: 'PRODUCER_REJECT',
      entityType: 'producer',
      entityId: producerId,
      ...createRejectionContext(existingProducer, parsed.data.rejectionReason)
    })

    return NextResponse.json({
      success: true,
      message: 'Ο παραγωγός απορρίφθηκε',
      producer
    })

  } catch (error: unknown) {
    console.error('Producer rejection error:', error)

    // Handle AdminError
    if (error instanceof AdminError) {
      if (error.code === 'NOT_AUTHENTICATED') {
        return NextResponse.json({ error: 'Απαιτείται σύνδεση' }, { status: 401 })
      }
      return NextResponse.json({ error: 'Απαιτείται σύνδεση διαχειριστή' }, { status: 403 })
    }

    // Handle Prisma errors
    if ((error as any)?.code === 'P2025') {
      return NextResponse.json({ error: 'Ο παραγωγός δεν βρέθηκε' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Σφάλμα διακομιστή' }, { status: 500 })
  }
}
