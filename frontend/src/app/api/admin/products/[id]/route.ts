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
    const { isActive, price, stock, title, description, category, unit } = body

    // Fetch current product for audit trail
    const currentProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        unit: true,
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
    const oldValue: Record<string, number | boolean | string> = {}
    const newValue: Record<string, number | boolean | string> = {}
    let hasChanges = false

    if (isActive !== undefined && typeof isActive === 'boolean') {
      updateData.isActive = isActive
      if (currentProduct.isActive !== isActive) {
        oldValue.isActive = currentProduct.isActive
        newValue.isActive = isActive
        hasChanges = true
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
        oldValue.price = currentProduct.price
        newValue.price = newPrice
        hasChanges = true
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
        oldValue.stock = currentProduct.stock
        newValue.stock = newStock
        hasChanges = true
      }
    }

    if (title !== undefined && typeof title === 'string') {
      const trimmedTitle = title.trim()
      if (trimmedTitle.length < 3) {
        return NextResponse.json(
          { error: 'Ο τίτλος πρέπει να έχει τουλάχιστον 3 χαρακτήρες' },
          { status: 400 }
        )
      }
      updateData.title = trimmedTitle
      if (currentProduct.title !== trimmedTitle) {
        oldValue.title = currentProduct.title
        newValue.title = trimmedTitle
        hasChanges = true
      }
    }

    if (description !== undefined) {
      const trimmedDesc = typeof description === 'string' ? description.trim() : null
      updateData.description = trimmedDesc
      if (currentProduct.description !== trimmedDesc) {
        oldValue.description = currentProduct.description || ''
        newValue.description = trimmedDesc || ''
        hasChanges = true
      }
    }

    if (category !== undefined && typeof category === 'string') {
      const trimmedCategory = category.trim()
      if (trimmedCategory.length === 0) {
        return NextResponse.json(
          { error: 'Η κατηγορία είναι υποχρεωτική' },
          { status: 400 }
        )
      }
      updateData.category = trimmedCategory
      if (currentProduct.category !== trimmedCategory) {
        oldValue.category = currentProduct.category
        newValue.category = trimmedCategory
        hasChanges = true
      }
    }

    if (unit !== undefined && typeof unit === 'string') {
      const trimmedUnit = unit.trim()
      if (trimmedUnit.length === 0) {
        return NextResponse.json(
          { error: 'Η μονάδα μέτρησης είναι υποχρεωτική' },
          { status: 400 }
        )
      }
      updateData.unit = trimmedUnit
      if (currentProduct.unit !== trimmedUnit) {
        oldValue.unit = currentProduct.unit
        newValue.unit = trimmedUnit
        hasChanges = true
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
        description: true,
        category: true,
        unit: true,
        price: true,
        stock: true,
        isActive: true,
        approvalStatus: true
      }
    })

    // Log admin action for audit trail (only if there were actual changes)
    if (hasChanges) {
      await logAdminAction({
        admin,
        action: 'PRODUCT_UPDATE',
        entityType: 'product',
        entityId: productId,
        oldValue,
        newValue
      })
    }

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
