import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { requireAdmin, AdminError } from '@/lib/auth/admin'
import { logAdminAction, createRejectionContext } from '@/lib/audit/logger'
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
    // Get admin context for audit logging
    const admin = await requireAdmin()
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

    // Fetch existing product for audit log (oldValue)
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, title: true, approvalStatus: true, isActive: true }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Το προϊόν δεν βρέθηκε' }, { status: 404 })
    }

    // Update product
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

    // Audit log with rejection reason
    await logAdminAction({
      admin,
      action: 'PRODUCT_REJECT',
      entityType: 'product',
      entityId: productId,
      ...createRejectionContext(existingProduct, parsed.data.rejectionReason)
    })

    return NextResponse.json({
      success: true,
      message: 'Το προϊόν απορρίφθηκε',
      product
    })

  } catch (error: unknown) {
    console.error('Product rejection error:', error)

    // Handle AdminError
    if (error instanceof AdminError) {
      if (error.code === 'NOT_AUTHENTICATED') {
        return NextResponse.json({ error: 'Απαιτείται σύνδεση' }, { status: 401 })
      }
      return NextResponse.json({ error: 'Απαιτείται σύνδεση διαχειριστή' }, { status: 403 })
    }

    // Handle Prisma errors
    if ((error as any)?.code === 'P2025') {
      return NextResponse.json({ error: 'Το προϊόν δεν βρέθηκε' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Σφάλμα διακομιστή' }, { status: 500 })
  }
}
