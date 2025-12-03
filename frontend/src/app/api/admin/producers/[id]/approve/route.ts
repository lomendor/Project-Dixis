import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/admin'

/**
 * POST /api/admin/producers/[id]/approve
 * Approves a producer (sets approvalStatus to 'approved')
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

    const producer = await prisma.producer.update({
      where: { id: producerId },
      data: {
        approvalStatus: 'approved',
        isActive: true,
        rejectionReason: null  // Clear any previous rejection
      },
      select: {
        id: true,
        name: true,
        approvalStatus: true,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Ο παραγωγός εγκρίθηκε επιτυχώς',
      producer
    })

  } catch (error: any) {
    console.error('Producer approval error:', error)

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
