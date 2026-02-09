import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Public Products Listing API
 * Used by (storefront)/products/page.tsx via INTERNAL_API_URL.
 * Returns Laravel-compatible format for the product catalog.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim() || searchParams.get('search')?.trim() || ''
    const where: Record<string, unknown> = { isActive: true }
    if (q) where.title = { contains: q }
    const items = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        producer: { select: { id: true, name: true, slug: true } },
      },
    })
    // Transform to Laravel API format expected by products page
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = items.map((p: any) => ({
      id: p.id,
      name: p.title,
      slug: p.slug,
      description: p.description,
      price: p.price,
      unit: p.unit || 'kg',
      stock: p.stock ?? 0,
      is_active: p.isActive,
      category: p.category,
      image_url: p.imageUrl,
      producer_id: p.producerId,
      producer: p.producer
        ? { id: p.producer.id, name: p.producer.name, slug: p.producer.slug }
        : null,
    }))
    return NextResponse.json(
      { ok: true, count: data.length, data },
      { headers: { 'cache-control': 'no-store' } }
    )
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error'
    console.error('[API] public/products error:', message)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
