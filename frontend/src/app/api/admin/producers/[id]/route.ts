import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { z } from 'zod'
import { getRequestId, logWithId } from '@/lib/observability/request'
import { requireAdmin } from '@/lib/auth/admin'

const UpdateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  region: z.string().min(2).optional(),
  category: z.string().min(2).optional(),
  description: z.string().optional(),
  email: z.string().email().optional().or(z.literal('').transform((): undefined => undefined)),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
  toggleActive: z.boolean().optional() // convenience
})

export async function PATCH(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const rid = getRequestId(_req.headers)

  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Απαιτείται σύνδεση διαχειριστή' }, { status: 403 })
  }

  const params = await ctx.params
  const id = params.id
  const body = await _req.json().catch(() => ({}))
  const parsed = UpdateSchema.safeParse(body)

  if (!parsed.success) {
    const res = NextResponse.json(
      { error: 'Λάθος δεδομένα', issues: parsed.error.format() },
      { status: 400 }
    )
    res.headers.set('x-request-id', rid)
    logWithId(rid, `PATCH /api/admin/producers/${id} [validation error]`, { error: parsed.error.format() })
    return res
  }

  const existing = await prisma.producer.findUnique({ where: { id } })
  if (!existing) {
    const res = NextResponse.json({ error: 'Δεν βρέθηκε' }, { status: 404 })
    res.headers.set('x-request-id', rid)
    logWithId(rid, `PATCH /api/admin/producers/${id} [not found]`)
    return res
  }

  const isActive = parsed.data.toggleActive ? !existing.isActive : parsed.data.isActive

  const item = await prisma.producer.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      region: parsed.data.region,
      category: parsed.data.category,
      description: parsed.data.description,
      email: parsed.data.email,
      phone: parsed.data.phone,
      isActive: typeof isActive === 'boolean' ? isActive : undefined
    }
  })

  const res = NextResponse.json({ item })
  res.headers.set('x-request-id', rid)
  logWithId(rid, `PATCH /api/admin/producers/${id} [updated]`, {
    toggleActive: parsed.data.toggleActive,
    wasActive: existing.isActive,
    nowActive: item.isActive
  })
  return res
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const rid = getRequestId(_req.headers)

  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Απαιτείται σύνδεση διαχειριστή' }, { status: 403 })
  }

  const params = await ctx.params
  const id = params.id
  await prisma.producer.delete({ where: { id } })
  const res = NextResponse.json({ ok: true })
  res.headers.set('x-request-id', rid)
  logWithId(rid, `DELETE /api/admin/producers/${id} [deleted]`)
  return res
}
