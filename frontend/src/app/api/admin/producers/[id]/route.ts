import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { z } from 'zod'

const UpdateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  region: z.string().min(2).optional(),
  category: z.string().min(2).optional(),
  description: z.string().optional(),
  email: z.string().email().optional().or(z.literal('').transform(() => undefined)),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
  toggleActive: z.boolean().optional() // convenience
})

export async function PATCH(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const params = await ctx.params
  const id = params.id
  const body = await _req.json().catch(() => ({}))
  const parsed = UpdateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Λάθος δεδομένα', issues: parsed.error.format() },
      { status: 400 }
    )
  }

  const existing = await prisma.producer.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Δεν βρέθηκε' }, { status: 404 })
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

  return NextResponse.json({ item })
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const params = await ctx.params
  const id = params.id
  await prisma.producer.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
