import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function moneyEUR(n: number) {
  try { return new Intl.NumberFormat('el-GR',{ style:'currency', currency:'EUR' }).format(n) }
  catch { return `${n} €` }
}

export const revalidate = 30

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10) || 1, 1)
    const pageSize = Math.min(Math.max(parseInt(searchParams.get('pageSize') || '20', 10) || 20, 1), 48)
    const skip = (page - 1) * pageSize
    const take = pageSize

    const [total, rows] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.findMany({
        where: { isActive: true },
        include: { producer: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip, take,
      })
    ])

    const items = rows.map(p => ({
      id: p.id,
      title: p.title,
      producerName: p.producer?.name ?? 'Παραγωγός',
      priceCents: Math.round(p.price * 100),
      imageUrl: p.imageUrl ?? '',
    }))

    const res = NextResponse.json({ items, total, page, pageSize })
    res.headers.set('Cache-Control','public, max-age=15, s-maxage=30, stale-while-revalidate=60')
    return res
  } catch (e) {
    return NextResponse.json({ items: [], total: 0, page: 1, pageSize: 20 }, { status: 200 })
  }
}
