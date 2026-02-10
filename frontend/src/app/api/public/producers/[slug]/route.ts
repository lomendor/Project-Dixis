import { NextResponse } from 'next/server'
import { getLaravelInternalUrl } from '@/env'
import { toStorefrontSlug } from '@/lib/category-map'

export const dynamic = 'force-dynamic'

/**
 * STOREFRONT-LARAVEL-01: Public Producer Detail API
 * Proxies to Laravel PublicProducerController@show instead of querying Prisma.
 * Returns producer with their active products.
 *
 * Laravel is the SSOT for producers (see docs/AGENT/research/DUAL-DB-RESEARCH.md).
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
    const laravelBase = getLaravelInternalUrl()
    const res = await fetch(`${laravelBase}/public/producers/${slug}`, {
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      cache: 'no-store',
    })

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ error: 'not found' }, { status: 404 })
      }
      console.error('[API] Laravel public/producers/', slug, 'failed:', res.status)
      return NextResponse.json(
        { error: `Laravel API error: ${res.status}` },
        { status: res.status }
      )
    }

    const json = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = json?.data ?? json

    if (!p || !p.id) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    // Map Laravel format to the format expected by /producers/[slug] page
    // Laravel returns: { id, name, slug, description, location, products: [...] }
    // Frontend expects: { id, slug, name, region, category, description, image_url, products: [...] }
    const products = p.products || []

    const data = {
      id: p.id,
      slug: p.slug,
      name: p.name,
      // Laravel uses 'location', frontend expects 'region'
      region: p.location || p.region || '',
      category: p.category || '',
      description: p.description,
      image_url: p.image_url || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      products: products.map((prod: any) => {
        const categories = prod.categories || []
        const images = prod.images || []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const primaryImage = images.find((img: any) => img.is_primary) || images[0]

        return {
          id: prod.id,
          slug: prod.slug,
          name: prod.name,
          price: typeof prod.price === 'string' ? parseFloat(prod.price) : prod.price,
          unit: prod.unit || 'kg',
          stock: typeof prod.stock === 'number' ? prod.stock : 0,
          image_url: primaryImage?.url || prod.image_url || null,
          category: toStorefrontSlug(categories[0]?.slug || prod.category),
        }
      }),
    }

    return NextResponse.json(
      { ok: true, data },
      { headers: { 'cache-control': 'no-store' } }
    )
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error'
    console.error('[API] public/producers/[slug] proxy error:', message)
    return NextResponse.json(
      { error: 'Proxy error', message },
      { status: 500 }
    )
  }
}
