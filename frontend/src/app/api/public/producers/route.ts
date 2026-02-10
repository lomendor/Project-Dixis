import { NextResponse } from 'next/server'
import { getLaravelInternalUrl } from '@/env'

export const dynamic = 'force-dynamic'

/**
 * STOREFRONT-LARAVEL-01: Public Producers Listing API
 * Proxies to Laravel PublicProducerController instead of querying Prisma.
 * This ensures the storefront shows the same producers that exist in Laravel.
 *
 * Laravel is the SSOT for producers (see docs/AGENT/research/DUAL-DB-RESEARCH.md).
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')?.trim() || searchParams.get('q')?.trim() || ''

    // Build Laravel URL with query params
    const laravelBase = getLaravelInternalUrl()
    const url = new URL(`${laravelBase}/public/producers`)
    if (search) url.searchParams.set('search', search)
    url.searchParams.set('per_page', '100')

    const res = await fetch(url.toString(), {
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error('[API] Laravel public/producers failed:', res.status, res.statusText)
      return NextResponse.json(
        { ok: false, error: `Laravel API error: ${res.status}` },
        { status: res.status }
      )
    }

    const json = await res.json()
    const producers = json?.data ?? []

    // Map Laravel format to the format expected by /producers page
    // Laravel returns: { id, name, slug, description, location, is_active, products_count }
    // Frontend expects: { id, slug, name, region, category, description, image_url, products_count }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = producers.map((p: any) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      // Laravel uses 'location', frontend expects 'region'
      region: p.location || p.region || '',
      // Laravel producers don't have a single category field; use empty string
      category: p.category || '',
      description: p.description,
      image_url: p.image_url || null,
      products_count: p.products_count ?? 0,
    }))

    return NextResponse.json(
      { ok: true, count: data.length, data },
      { headers: { 'cache-control': 'public, s-maxage=60, stale-while-revalidate=30' } }
    )
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error'
    console.error('[API] public/producers proxy error:', message)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
