import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, AdminError } from '@/lib/auth/admin'
import { logAdminAction } from '@/lib/audit/logger'
import { getLaravelInternalUrl } from '@/env'
import { cookies } from 'next/headers'

/**
 * Phase 5.1: Admin product update now proxies to Laravel (SSOT).
 * Admin auth + audit logging still uses Prisma.
 * Product mutations go to Laravel so changes appear on the storefront.
 */

async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('dixis_session')?.value ?? null
}

/**
 * PATCH /api/admin/products/[id]
 * Update product properties via Laravel (admin only)
 * Supports: isActive, price, stock, title, description, category, unit
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    const { id: productId } = await params

    if (!productId) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const { isActive, price, stock, title, description, category, unit } = body

    // Build Laravel update payload (snake_case for Laravel)
    const laravelPayload: Record<string, unknown> = {}
    const oldValue: Record<string, string | number | boolean> = {}
    const newValue: Record<string, string | number | boolean> = {}

    if (isActive !== undefined && typeof isActive === 'boolean') {
      laravelPayload.is_active = isActive
      newValue.isActive = isActive
    }

    if (price !== undefined) {
      const newPrice = typeof price === 'number' ? price : parseFloat(String(price))
      if (isNaN(newPrice) || newPrice < 0) {
        return NextResponse.json(
          { error: 'Η τιμή πρέπει να είναι θετικός αριθμός' },
          { status: 400 }
        )
      }
      laravelPayload.price = newPrice
      newValue.price = newPrice
    }

    if (stock !== undefined) {
      const newStock = typeof stock === 'number' ? stock : parseInt(String(stock), 10)
      if (isNaN(newStock) || newStock < 0) {
        return NextResponse.json(
          { error: 'Το στοκ πρέπει να είναι μη-αρνητικός αριθμός' },
          { status: 400 }
        )
      }
      laravelPayload.stock = newStock
      newValue.stock = newStock
    }

    if (title !== undefined && typeof title === 'string') {
      const trimmedTitle = title.trim()
      if (trimmedTitle.length < 3) {
        return NextResponse.json(
          { error: 'Ο τίτλος πρέπει να έχει τουλάχιστον 3 χαρακτήρες' },
          { status: 400 }
        )
      }
      laravelPayload.name = trimmedTitle
      newValue.title = trimmedTitle
    }

    if (description !== undefined) {
      const trimmedDesc = typeof description === 'string' ? description.trim() : null
      laravelPayload.description = trimmedDesc
      newValue.description = trimmedDesc || ''
    }

    if (category !== undefined && typeof category === 'string') {
      const trimmedCategory = category.trim()
      if (trimmedCategory.length === 0) {
        return NextResponse.json(
          { error: 'Η κατηγορία είναι υποχρεωτική' },
          { status: 400 }
        )
      }
      laravelPayload.category = trimmedCategory
      newValue.category = trimmedCategory
    }

    if (unit !== undefined && typeof unit === 'string') {
      const trimmedUnit = unit.trim()
      if (trimmedUnit.length === 0) {
        return NextResponse.json(
          { error: 'Η μονάδα μέτρησης είναι υποχρεωτική' },
          { status: 400 }
        )
      }
      laravelPayload.unit = trimmedUnit
      newValue.unit = trimmedUnit
    }

    if (Object.keys(laravelPayload).length === 0) {
      return NextResponse.json({ success: true, product: { id: productId } })
    }

    // Proxy to Laravel PATCH /v1/products/{id}
    const sessionToken = await getSessionToken()
    const laravelBase = getLaravelInternalUrl()
    const url = new URL(`${laravelBase}/products/${productId}`)

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`
    }

    const res = await fetch(url.toString(), {
      method: 'PATCH',
      headers,
      body: JSON.stringify(laravelPayload),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      console.error('[Admin] Laravel product update failed:', res.status, errorData)

      if (res.status === 404) {
        return NextResponse.json({ error: 'Το προϊόν δεν βρέθηκε' }, { status: 404 })
      }

      return NextResponse.json(
        { error: errorData.message || 'Σφάλμα ενημέρωσης' },
        { status: res.status }
      )
    }

    const data = await res.json()
    const product = data.data || data

    const updatedProduct = {
      id: String(product.id),
      title: product.name || product.title,
      description: product.description,
      category: product.category,
      unit: product.unit,
      price: parseFloat(product.price),
      stock: typeof product.stock === 'number' ? product.stock : 0,
      isActive: product.is_active !== false,
      approvalStatus: product.approval_status || 'approved',
    }

    // Audit log (still uses Prisma — admin audit trail)
    if (Object.keys(newValue).length > 0) {
      try {
        await logAdminAction({
          admin,
          action: 'PRODUCT_UPDATE',
          entityType: 'product',
          entityId: productId,
          oldValue,
          newValue,
        })
      } catch (auditErr) {
        // Don't fail the request if audit logging fails
        console.error('[Admin] Audit log failed:', auditErr)
      }
    }

    return NextResponse.json({ success: true, product: updatedProduct })

  } catch (error: unknown) {
    console.error('Admin product update error:', error)

    if (error instanceof AdminError) {
      if (error.code === 'NOT_AUTHENTICATED') {
        return NextResponse.json({ error: 'Απαιτείται σύνδεση' }, { status: 401 })
      }
      return NextResponse.json({ error: 'Απαιτείται σύνδεση διαχειριστή' }, { status: 403 })
    }

    return NextResponse.json({ error: 'Σφάλμα διακομιστή' }, { status: 500 })
  }
}
