import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { requireAdmin } from '@/lib/auth/admin'

/**
 * POST /api/admin/products/[id]/approve
 * Approves a product (sets approvalStatus to 'approved')
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id: productId } = await params

    if (!productId) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        approvalStatus: 'approved',
        isActive: true,
        rejectionReason: null
      },
      select: {
        id: true,
        title: true,
        approvalStatus: true,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Το προϊόν εγκρίθηκε επιτυχώς',
      product
    })

  } catch (error: any) {
    console.error('Product approval error:', error)

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
