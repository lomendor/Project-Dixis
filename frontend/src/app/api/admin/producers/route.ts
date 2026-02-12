import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getLaravelInternalUrl } from '@/env'
import { cookies } from 'next/headers'

/**
 * PRODUCER-ONBOARD-01: Admin producer list — proxy to Laravel SSOT
 * Replaces previous public-endpoint proxy with admin-authenticated endpoint
 */

async function getAuthToken(req: NextRequest): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('auth_token')?.value
    || cookieStore.get('dixis_session')?.value
    || req.headers.get('authorization')?.replace('Bearer ', '')
    || null
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Απαιτείται σύνδεση διαχειριστή' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'all'

  try {
    const token = await getAuthToken(req)
    const laravelBase = getLaravelInternalUrl()
    const url = new URL(`${laravelBase}/admin/producers`)
    url.searchParams.set('status', status)
    url.searchParams.set('per_page', '100')

    const headers: Record<string, string> = { 'Accept': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(url.toString(), { headers, cache: 'no-store' })

    if (!res.ok) {
      return NextResponse.json({ error: 'Σφάλμα ανάκτησης παραγωγών' }, { status: res.status })
    }

    const json = await res.json()
    const producers = json?.data ?? []

    // Map Laravel status to frontend approval status
    // Laravel: pending/active/inactive → Frontend: pending/approved/rejected
    const mapStatus = (s: string): string => {
      if (s === 'active') return 'approved'
      if (s === 'inactive') return 'rejected'
      return 'pending'
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = producers.map((p: any) => ({
      id: String(p.id),
      name: p.name || p.business_name || '',
      businessName: p.business_name || '',
      region: p.region || p.location || '',
      approvalStatus: mapStatus(p.status || 'pending'),
      isActive: p.is_active !== false,
      rejectionReason: p.rejection_reason || null,
      email: p.email || p.user?.email || '',
      phone: p.phone || '',
      description: p.description || '',
      city: p.city || '',
      taxId: p.tax_id || '',
      createdAt: p.created_at,
    }))

    return NextResponse.json({ items, total: json.total || items.length })
  } catch (error) {
    console.error('[Admin] Producers proxy error:', error)
    return NextResponse.json({ error: 'Σφάλμα διακομιστή' }, { status: 500 })
  }
}
