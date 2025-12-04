import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { requireAdmin, AdminError } from '@/lib/auth/admin'
import { logAdminAction, createApprovalContext } from '@/lib/audit/logger'

/**
 * POST /api/admin/products/[id]/approve
 * Approves a product (sets approvalStatus to 'approved')
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

    // Audit log
    await logAdminAction({
      admin,
      action: 'PRODUCT_APPROVE',
      entityType: 'product',
      entityId: productId,
      ...createApprovalContext(existingProduct)
    })

    return NextResponse.json({
      success: true,
      message: 'Το προϊόν εγκρίθηκε επιτυχώς',
      product
    })

  } catch (error: unknown) {
    console.error('Product approval error:', error)

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
