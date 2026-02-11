import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, AdminError } from '@/lib/auth/admin'
import { logAdminAction, createRejectionContext } from '@/lib/audit/logger'
import { getLaravelInternalUrl } from '@/env'
import { cookies } from 'next/headers'
import { z } from 'zod'

const RejectSchema = z.object({
  rejectionReason: z.string().min(5, 'Ο λόγος απόρριψης πρέπει να έχει τουλάχιστον 5 χαρακτήρες')
})

/**
 * POST /api/admin/products/[id]/reject
 * Phase 5.5b: Proxies to Laravel PATCH /v1/admin/products/{id}/moderate
 * Admin auth + audit logging still uses Prisma.
 */

async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('dixis_session')?.value ?? null
}

export async function POST(
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
    const parsed = RejectSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Λάθος δεδομένα' },
        { status: 400 }
      )
    }

    // Proxy to Laravel moderate endpoint
    const sessionToken = await getSessionToken()
    const laravelBase = getLaravelInternalUrl()
    const url = new URL(`${laravelBase}/admin/products/${productId}/moderate`)

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
      body: JSON.stringify({
        action: 'reject',
        reason: parsed.data.rejectionReason,
      }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      console.error('[Admin] Laravel product reject failed:', res.status, errorData)

      if (res.status === 404) {
        return NextResponse.json({ error: 'Το προϊόν δεν βρέθηκε' }, { status: 404 })
      }

      return NextResponse.json(
        { error: errorData.message || 'Σφάλμα απόρριψης' },
        { status: res.status }
      )
    }

    const data = await res.json()
    const p = data.product || data

    const product = {
      id: String(p.id),
      title: p.name || p.title,
      approvalStatus: p.approval_status || 'rejected',
      isActive: p.is_active !== undefined ? p.is_active : false,
      rejectionReason: p.rejection_reason || parsed.data.rejectionReason,
    }

    // Audit log (still uses Prisma)
    try {
      await logAdminAction({
        admin,
        action: 'PRODUCT_REJECT',
        entityType: 'product',
        entityId: productId,
        ...createRejectionContext(
          { approvalStatus: 'pending', isActive: true },
          parsed.data.rejectionReason
        )
      })
    } catch (auditErr) {
      console.error('[Admin] Audit log failed:', auditErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Το προϊόν απορρίφθηκε',
      product
    })

  } catch (error: unknown) {
    console.error('Product rejection error:', error)

    if (error instanceof AdminError) {
      if (error.code === 'NOT_AUTHENTICATED') {
        return NextResponse.json({ error: 'Απαιτείται σύνδεση' }, { status: 401 })
      }
      return NextResponse.json({ error: 'Απαιτείται σύνδεση διαχειριστή' }, { status: 403 })
    }

    return NextResponse.json({ error: 'Σφάλμα διακομιστή' }, { status: 500 })
  }
}
