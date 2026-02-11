import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getRequestId, logWithId } from '@/lib/observability/request'
import { requireAdmin } from '@/lib/auth/admin'
import { getLaravelInternalUrl } from '@/env'
import { cookies } from 'next/headers'

/**
 * Phase 5.2: Admin producer routes now proxy to Laravel (SSOT).
 * Admin authentication still uses Prisma AdminUser table.
 * Producer CRUD goes to Laravel so producers appear on the storefront.
 */

const CreateSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  region: z.string().min(2),
  category: z.string().min(2),
  description: z.string().optional(),
  email: z.string().email().optional().or(z.literal('').transform((): undefined => undefined)),
  phone: z.string().optional(),
  isActive: z.boolean().optional()
})

async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('dixis_session')?.value ?? null
}

export async function GET(req: Request) {
  const rid = getRequestId(req.headers)

  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Απαιτείται σύνδεση διαχειριστή' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const active = searchParams.get('active') || ''
  const sort = searchParams.get('sort') || 'name-asc'

  try {
    // Proxy to Laravel public producers endpoint
    const laravelBase = getLaravelInternalUrl()
    const url = new URL(`${laravelBase}/public/producers`)
    if (q) url.searchParams.set('search', q)
    url.searchParams.set('per_page', '100')

    const res = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error('[Admin] Laravel producers fetch failed:', res.status)
      return NextResponse.json({ error: 'Σφάλμα ανάκτησης παραγωγών' }, { status: res.status })
    }

    const json = await res.json()
    const producers = json?.data ?? []

    // Map Laravel format to admin panel format and apply filters
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let items = producers.map((p: any) => ({
      id: String(p.id),
      name: p.name,
      region: p.location || p.region || '',
      category: p.category || '',
      isActive: p.is_active !== false,
      approvalStatus: p.approval_status || 'approved',
      rejectionReason: p.rejection_reason || null,
    }))

    // Apply active filter
    if (active === 'only') {
      items = items.filter((p: { isActive: boolean }) => p.isActive)
    }

    // Apply sort
    if (sort === 'name-desc') {
      items.sort((a: { name: string }, b: { name: string }) => b.name.localeCompare(a.name, 'el'))
    } else {
      items.sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, 'el'))
    }

    const response = NextResponse.json({ items })
    response.headers.set('x-request-id', rid)
    logWithId(rid, 'GET /api/admin/producers [laravel-proxy]', { count: items.length, q, active, sort })
    return response
  } catch (error) {
    console.error('[Admin] Producers proxy error:', error)
    return NextResponse.json({ error: 'Σφάλμα διακομιστή' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const rid = getRequestId(req.headers)

  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Απαιτείται σύνδεση διαχειριστή' }, { status: 403 })
  }

  const data = await req.json().catch(() => ({}))
  const parsed = CreateSchema.safeParse(data)

  if (!parsed.success) {
    const res = NextResponse.json(
      { error: 'Λάθος δεδομένα', issues: parsed.error.format() },
      { status: 400 }
    )
    res.headers.set('x-request-id', rid)
    logWithId(rid, 'POST /api/admin/producers [validation error]', { error: parsed.error.format() })
    return res
  }

  try {
    const sessionToken = await getSessionToken()
    const laravelBase = getLaravelInternalUrl()
    const url = new URL(`${laravelBase}/producers`)

    // Map to Laravel format
    const laravelPayload = {
      name: parsed.data.name,
      slug: parsed.data.slug,
      location: parsed.data.region,
      description: parsed.data.description || null,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      is_active: parsed.data.isActive ?? true,
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify(laravelPayload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[Admin] Laravel producer create failed:', response.status, errorData)
      return NextResponse.json(
        { error: errorData.message || 'Σφάλμα δημιουργίας παραγωγού' },
        { status: response.status }
      )
    }

    const result = await response.json()
    const producer = result.data || result

    const item = {
      id: String(producer.id),
      name: producer.name,
      slug: producer.slug,
      region: producer.location || parsed.data.region,
      category: parsed.data.category,
      isActive: producer.is_active !== false,
    }

    const res = NextResponse.json({ item }, { status: 201 })
    res.headers.set('x-request-id', rid)
    logWithId(rid, 'POST /api/admin/producers [created via laravel]', { id: item.id, name: item.name })
    return res
  } catch (error) {
    console.error('[Admin] Producer create proxy error:', error)
    return NextResponse.json({ error: 'Σφάλμα δημιουργίας παραγωγού' }, { status: 500 })
  }
}
