import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Public Producer Detail API
 * Returns a single approved producer with their active products.
 * Pattern follows api/public/products/[id]/route.ts
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  if (!slug) {
    return NextResponse.json({ error: 'missing slug' }, { status: 400 })
  }

  try {
    const producer = await prisma.producer.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
        isActive: true,
        approvalStatus: 'approved',
      },
      select: {
        id: true,
        slug: true,
        name: true,
        region: true,
        category: true,
        description: true,
        imageUrl: true,
        Product: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            slug: true,
            title: true,
            price: true,
            unit: true,
            stock: true,
            imageUrl: true,
            category: true,
          },
        },
      },
    })

    if (!producer) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    const data = {
      id: producer.id,
      slug: producer.slug,
      name: producer.name,
      region: producer.region,
      category: producer.category,
      description: producer.description,
      image_url: producer.imageUrl,
      products: producer.Product.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.title,
        price: p.price,
        unit: p.unit,
        stock: p.stock,
        image_url: p.imageUrl,
        category: p.category,
      })),
    }

    return NextResponse.json(
      { ok: true, data },
      { headers: { 'cache-control': 'no-store' } }
    )
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error'
    console.error('[API] public/producers/[slug] error:', message)
    return NextResponse.json(
      { error: 'Database error', message },
      { status: 500 }
    )
  }
}
