import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getAdminToken, handleAdminError } from '@/lib/admin/laravelProxy'
import { getLaravelInternalUrl } from '@/env'

/** B2B PIVOT: Approve business — proxy to Laravel */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try { await requireAdmin() } catch (e) { return handleAdminError(e) }
  const { id } = await params
  try {
    const token = await getAdminToken()
    const headers: Record<string, string> = { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(`${getLaravelInternalUrl()}/admin/businesses/${id}/approve`, { method: 'PATCH', headers, cache: 'no-store' })
    if (!res.ok) return NextResponse.json({ error: 'Approve failed' }, { status: res.status })
    const data = await res.json()
    return NextResponse.json({ success: true, business: data.business })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
