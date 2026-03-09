import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getAdminToken, handleAdminError } from '@/lib/admin/laravelProxy'
import { getLaravelInternalUrl } from '@/env'

/** B2B PIVOT: Admin business list — proxy to Laravel */
export async function GET(req: NextRequest) {
  try { await requireAdmin() } catch (e) { return handleAdminError(e) }

  const status = new URL(req.url).searchParams.get('status') || 'all'
  try {
    const token = await getAdminToken()
    const url = new URL(`${getLaravelInternalUrl()}/admin/businesses`)
    url.searchParams.set('status', status)
    url.searchParams.set('per_page', '100')

    const headers: Record<string, string> = { 'Accept': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(url.toString(), { headers, cache: 'no-store' })
    if (!res.ok) return NextResponse.json({ error: 'Fetch failed' }, { status: res.status })

    const json = await res.json()
    return NextResponse.json({ items: json.data ?? [], total: json.total ?? 0 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
