import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getLaravelInternalUrl } from '@/env'
import { cookies } from 'next/headers'

/**
 * PRODUCER-ONBOARD-01: Approve producer — proxy to Laravel SSOT
 * Replaces previous Prisma-based approve with Laravel admin endpoint
 */

async function getAuthToken(req: NextRequest): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('auth_token')?.value
    || cookieStore.get('dixis_session')?.value
    || req.headers.get('authorization')?.replace('Bearer ', '')
    || null
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Απαιτείται σύνδεση διαχειριστή' }, { status: 403 })
  }

  const { id: producerId } = await params

  if (!producerId) {
    return NextResponse.json({ error: 'Invalid producer ID' }, { status: 400 })
  }

  try {
    const token = await getAuthToken(request)
    const laravelBase = getLaravelInternalUrl()
    const url = `${laravelBase}/admin/producers/${producerId}/approve`

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(url, { method: 'PATCH', headers, cache: 'no-store' })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || 'Σφάλμα έγκρισης παραγωγού' },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json({
      success: true,
      message: data.message || 'Ο παραγωγός εγκρίθηκε επιτυχώς',
      producer: data.producer,
    })
  } catch (error) {
    console.error('[Admin] Producer approve proxy error:', error)
    return NextResponse.json({ error: 'Σφάλμα διακομιστή' }, { status: 500 })
  }
}
