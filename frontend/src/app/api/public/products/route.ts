import { NextResponse } from 'next/server'
import { getLaravelInternalUrl } from '@/env'
import { toStorefrontSlug } from '@/lib/category-map'

export const dynamic = 'force-dynamic'

/**
 * STOREFRONT-LARAVEL-01: Public Products Listing API
 * Proxies to Laravel PublicProductController instead of querying Prisma.
 * This ensures the storefront shows the same products that producers manage.
 *
 * Laravel is the SSOT for products (see docs/AGENT/research/DUAL-DB-RESEARCH.md).
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')?.trim() || searchParams.get('q')?.trim() || ''
    const category = searchParams.get('category')?.trim() || ''

    // Build Laravel URL with query params
    const laravelBase = getLaravelInternalUrl()
    const url = new URL(`${laravelBase}/public/products`)
    if (search) url.searchParams.set('search', search)
    if (category) url.searchParams.set('category', category)
    // Request up to 100 products (Laravel default is 15)
    url.searchParams.set('per_page', '100')

    const res = await fetch(url.toString(), {
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error('[API] Laravel public/products failed:', res.status, res.statusText)
      return NextResponse.json(
        { ok: false, error: `Laravel API error: ${res.status}` },
        { status: res.status }
      )
    }

    const json = await res.json()
    const products = json?.data ?? []

    // Map Laravel format to the format expected by storefront pages
    // Laravel returns: { id, name, slug, description, price, unit, stock, is_active,
    //   is_organic, image_url, producer: { id, name, slug, location }, categories, images }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = products.map((p: any) => {
      const categories = p.categories || []
      const images = p.images || []
      const primaryImage = images.find((img: any) => img.is_primary) || images[0]

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        unit: p.unit || 'kg',
        stock: typeof p.stock === 'number' ? p.stock : 0,
        is_active: p.is_active,
        category: toStorefrontSlug(categories[0]?.slug || p.category),
        image_url: primaryImage?.url || p.image_url || null,
        producer_id: p.producer_id || p.producer?.id || null,
        producer: p.producer
          ? { id: p.producer.id, name: p.producer.name, slug: p.producer.slug }
          : null,
      }
    })

    return NextResponse.json(
      { ok: true, count: data.length, data },
      { headers: { 'cache-control': 'public, s-maxage=60, stale-while-revalidate=30' } }
    )
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error'
    console.error('[API] public/products proxy error:', message)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
