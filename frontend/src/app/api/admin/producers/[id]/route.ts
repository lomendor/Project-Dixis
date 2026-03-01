import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getAdminToken, handleAdminError } from '@/lib/admin/laravelProxy'
import { getLaravelInternalUrl } from '@/env'

/**
 * ADMIN-LATLNG-01: Update producer profile fields — proxy to Laravel SSOT
 */

export async function PATCH(
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

  try {
    const body = await request.json()
    const token = await getAdminToken()
    const laravelBase = getLaravelInternalUrl()
    const url = `${laravelBase}/admin/producers/${producerId}`

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || 'Σφάλμα ενημέρωσης παραγωγού' },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json({
      success: true,
      message: data.message || 'Ενημερώθηκε',
      producer: data.producer,
    })
  } catch (error) {
    console.error('[Admin] Producer update proxy error:', error)
    return NextResponse.json({ error: 'Σφάλμα διακομιστή' }, { status: 500 })
  }
}
