import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { requireAdmin, AdminError } from '@/lib/auth/admin'
import { logAdminAction, createApprovalContext } from '@/lib/audit/logger'

/**
 * POST /api/admin/producers/[id]/approve
 * Approves a producer (sets approvalStatus to 'approved')
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
        approvalStatus: 'approved',
        isActive: true,
        rejectionReason: null
      },
      select: {
        id: true,
        name: true,
        approvalStatus: true,
        isActive: true
      }
    })

    // Audit log
    await logAdminAction({
      admin,
      action: 'PRODUCER_APPROVE',
      entityType: 'producer',
      entityId: producerId,
      ...createApprovalContext(existingProducer)
    })

    return NextResponse.json({
      success: true,
      message: 'Ο παραγωγός εγκρίθηκε επιτυχώς',
      producer
    })

  } catch (error: unknown) {
    console.error('Producer approval error:', error)

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
