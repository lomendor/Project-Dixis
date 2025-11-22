import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const g: any = globalThis as any
const prisma: PrismaClient = g.__prisma__ ?? new PrismaClient()
if (!g.__prisma__) g.__prisma__ = prisma

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)
    const pageSize = Math.min(Math.max(parseInt(searchParams.get('pageSize') || '12', 10), 1), 48)
    const skip = (page - 1) * pageSize

    const [total, rows] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          title: true,
          slug: true,
          priceCents: true,
          imageUrl: true,
          producer: { select: { name: true } },
        },
      }),
    ])

    const fmt = new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' })
    const items = rows.map((r) => ({
      id: r.id,
      title: r.title ?? 'Άγνωστο προϊόν',
      producerName: r.producer?.name ?? 'Παραγωγός',
      priceCents: r.priceCents,
      priceFormatted: typeof r.priceCents === 'number' ? fmt.format(r.priceCents / 100) : '—',
      imageUrl: r.imageUrl || 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=800&fit=crop',
    }))

    const res = NextResponse.json({ items, total, page, pageSize })
    res.headers.set('Cache-Control', 'public, max-age=10, s-maxage=20, stale-while-revalidate=60')
    return res
  } catch (_e) {
    // Δεν αποκαλύπτουμε error/secrets· UI να μη σπάει
    return NextResponse.json({ items: [], total: 0, page: 1, pageSize: 12 }, { status: 200 })
  }
}
