import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const revalidate = 30

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const pageSize = Math.min(48, Math.max(1, Number(searchParams.get('pageSize') ?? '12')))
  const skip = (page - 1) * pageSize

  try {
    const [total, rows] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.findMany({
        where: { isActive: true },
        include: { producer: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip, take: pageSize,
      })
    ])

    const fmt = new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' })
    const items = rows.map(p => ({
      id: p.id,
      title: p.title,
      producerName: p.producer?.name ?? 'Παραγωγός',
      priceFormatted: Number.isFinite(p.price) ? fmt.format(p.price) : '—',
      imageUrl: p.imageUrl ?? '',
    }))

    return NextResponse.json({ items, total, page, pageSize }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ items: [], total: 0, page, pageSize, error: 'API_ERROR' }, { status: 200 })
  }
}
