import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { z } from 'zod'
import { getRequestId, logWithId } from '@/lib/observability/request'
import { requireAdmin } from '@/lib/auth/admin'

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

  // UX-FILTERS: q (search), active (only/all), sort (name-asc/name-desc)
  const items = await prisma.producer.findMany({
    where: {
      AND: [
        q ? { name: { contains: q } } : {},
        active === 'only' ? { isActive: true } : {}
      ]
    },
    select: {
      id: true,
      name: true,
      region: true,
      category: true,
      isActive: true,
      approvalStatus: true,
      rejectionReason: true
    },
    orderBy: { name: sort === 'name-desc' ? 'desc' : 'asc' },
    take: 100
  })

  const res = NextResponse.json({ items })
  res.headers.set('x-request-id', rid)
  logWithId(rid, 'GET /api/admin/producers', { count: items.length, q, active, sort })
  return res
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

  const item = await prisma.producer.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      region: parsed.data.region,
      category: parsed.data.category,
      description: parsed.data.description,
      email: parsed.data.email,
      phone: parsed.data.phone,
      isActive: parsed.data.isActive ?? true
    }
  })

  const res = NextResponse.json({ item }, { status: 201 })
  res.headers.set('x-request-id', rid)
  logWithId(rid, 'POST /api/admin/producers [created]', { id: item.id, name: item.name })
  return res
}
