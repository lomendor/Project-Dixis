import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { requireAdmin, AdminError } from '@/lib/auth/admin'
import { logAdminAction } from '@/lib/audit/logger'

/**
 * PATCH /api/admin/products/[id]
 * Update product properties (admin only)
 * Supports: isActive, price, stock
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    const admin = await requireAdmin()
    const { id: productId } = await params

    if (!productId) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const { isActive, price, stock } = body

    // Fetch current product for audit trail
    const currentProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        title: true,
        isActive: true,
        price: true,
        stock: true
      }
    })

    if (!currentProduct) {
      return NextResponse.json({ error: 'Το προϊόν δεν βρέθηκε' }, { status: 404 })
    }

    // Build update data
    const updateData: Record<string, unknown> = {}
    const changes: Record<string, { old: unknown; new: unknown }> = {}

    if (isActive !== undefined && typeof isActive === 'boolean') {
      updateData.isActive = isActive
      if (currentProduct.isActive !== isActive) {
        changes.isActive = { old: currentProduct.isActive, new: isActive }
      }
    }

    if (price !== undefined) {
      const newPrice = typeof price === 'number' ? price : parseFloat(String(price))
      if (isNaN(newPrice) || newPrice < 0) {
        return NextResponse.json(
          { error: 'Η τιμή πρέπει να είναι θετικός αριθμός' },
          { status: 400 }
        )
      }
      updateData.price = newPrice
      if (currentProduct.price !== newPrice) {
        changes.price = { old: currentProduct.price, new: newPrice }
      }
    }

    if (stock !== undefined) {
      const newStock = typeof stock === 'number' ? stock : parseInt(String(stock), 10)
      if (isNaN(newStock) || newStock < 0) {
        return NextResponse.json(
          { error: 'Το στοκ πρέπει να είναι μη-αρνητικός αριθμός' },
          { status: 400 }
        )
      }
      updateData.stock = newStock
      if (currentProduct.stock !== newStock) {
        changes.stock = { old: currentProduct.stock, new: newStock }
      }
    }

    // If no changes, return current product
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: true, product: currentProduct })
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      select: {
        id: true,
        title: true,
        price: true,
        stock: true,
        isActive: true,
        approvalStatus: true
      }
    })

    // Log admin action for audit trail
    await logAdminAction({
      admin,
      action: 'PRODUCT_UPDATE',
      entityType: 'product',
      entityId: productId,
      oldValue: changes,
      newValue: updateData
    })

    return NextResponse.json({
      success: true,
      product: updatedProduct
    })

  } catch (error: unknown) {
    console.error('Admin product update error:', error)

    // Handle AdminError (authentication/authorization)
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
