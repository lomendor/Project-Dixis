import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Public Producers Listing API
 * Returns approved, active producers for the public /producers page.
 * Pattern follows api/public/products/route.ts
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim() || searchParams.get('search')?.trim() || ''

    const where: Record<string, unknown> = {
      isActive: true,
      approvalStatus: 'approved',
    }
    if (q) {
      where.name = { contains: q }
    }

    const items = await prisma.producer.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        region: true,
        category: true,
        description: true,
        imageUrl: true,
        _count: { select: { Product: { where: { isActive: true } } } },
      },
    })

    const data = items.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      region: p.region,
      category: p.category,
      description: p.description,
      image_url: p.imageUrl,
      products_count: p._count.Product,
    }))

    return NextResponse.json(
      { ok: true, count: data.length, data },
      { headers: { 'cache-control': 'no-store' } }
    )
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error'
    console.error('[API] public/producers error:', message)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
