import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { z } from 'zod'

const CreateSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  region: z.string().min(2),
  category: z.string().min(2),
  description: z.string().optional(),
  email: z.string().email().optional().or(z.literal('').transform(() => undefined)),
  phone: z.string().optional(),
  isActive: z.boolean().optional()
})

export async function GET(req: Request) {
  // TODO: Add admin session check (assume middleware/guard exists)
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const onlyActive = searchParams.get('active') === '1'

  const items = await prisma.producer.findMany({
    where: {
      AND: [
        q ? { name: { contains: q, mode: 'insensitive' } } : {},
        onlyActive ? { isActive: true } : {}
      ]
    },
    orderBy: { name: 'asc' },
    take: 100
  })

  return NextResponse.json({ items })
}

export async function POST(req: Request) {
  // TODO: Add admin session check
  const data = await req.json().catch(() => ({}))
  const parsed = CreateSchema.safeParse(data)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Λάθος δεδομένα', issues: parsed.error.format() },
      { status: 400 }
    )
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

  return NextResponse.json({ item }, { status: 201 })
}
