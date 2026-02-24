import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getAdminToken, handleAdminError } from '@/lib/admin/laravelProxy'
import { getLaravelInternalUrl } from '@/env'

/**
 * PRODUCER-ONBOARD-01: Reject producer — proxy to Laravel SSOT
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
  } catch (error) {
    return handleAdminError(error)
  }

  const { id: producerId } = await params

  if (!producerId) {
    return NextResponse.json({ error: 'Invalid producer ID' }, { status: 400 })
  }

  const body = await request.json().catch(() => ({}))
  const rejectionReason = body.rejectionReason || body.rejection_reason

  if (!rejectionReason || typeof rejectionReason !== 'string' || rejectionReason.length < 5) {
    return NextResponse.json(
      { error: 'Ο λόγος απόρριψης πρέπει να έχει τουλάχιστον 5 χαρακτήρες' },
      { status: 400 }
    )
  }

  try {
    const token = await getAdminToken()
    const laravelBase = getLaravelInternalUrl()
    const url = `${laravelBase}/admin/producers/${producerId}/reject`

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ rejection_reason: rejectionReason }),
      cache: 'no-store',
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || 'Σφάλμα απόρριψης παραγωγού' },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json({
      success: true,
      message: data.message || 'Ο παραγωγός απορρίφθηκε',
      producer: data.producer,
    })
  } catch (error) {
    console.error('[Admin] Producer reject proxy error:', error)
    return NextResponse.json({ error: 'Σφάλμα διακομιστή' }, { status: 500 })
  }
}
