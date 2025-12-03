import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { z } from 'zod'

const RejectSchema = z.object({
  rejectionReason: z.string().min(5, 'Ο λόγος απόρριψης πρέπει να έχει τουλάχιστον 5 χαρακτήρες')
})

/**
 * POST /api/admin/products/[id]/reject
 * Rejects a product (sets approvalStatus to 'rejected')
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params

    if (!productId) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const parsed = RejectSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Λάθος δεδομένα' },
        { status: 400 }
      )
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        approvalStatus: 'rejected',
        isActive: false,
        rejectionReason: parsed.data.rejectionReason
      },
      select: {
        id: true,
        title: true,
        approvalStatus: true,
        isActive: true,
        rejectionReason: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Το προϊόν απορρίφθηκε',
      product
    })

  } catch (error: any) {
    console.error('Product rejection error:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Το προϊόν δεν βρέθηκε' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Σφάλμα διακομιστή' },
      { status: 500 }
    )
  }
}
