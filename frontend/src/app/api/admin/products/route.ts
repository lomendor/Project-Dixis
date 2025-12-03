import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const approval = searchParams.get('approval') || ''

  const items = await prisma.product.findMany({
    where: {
      AND: [
        q ? { title: { contains: q, mode: 'insensitive' } } : {},
        approval ? { approvalStatus: approval } : {}
      ]
    },
    select: {
      id: true,
      title: true,
      price: true,
      unit: true,
      stock: true,
      isActive: true,
      approvalStatus: true,
      rejectionReason: true
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  })

  return NextResponse.json({ items })
}
