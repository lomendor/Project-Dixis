import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getLaravelInternalUrl } from '@/env'
import { toStorefrontSlug } from '@/lib/category-map'

/**
 * @deprecated LEGACY ROUTE — used by E2E tests and as fallback.
 * The storefront uses /api/public/products (Laravel proxy) since Phase 1.
 *
 * Phase 5.4: Now tries Laravel first, falls back to Prisma (for CI where
 * Laravel is unavailable). Response format unchanged for test compatibility.
 *
 * See docs/AGENT/research/DUAL-DB-RESEARCH.md for context.
 */

export const revalidate = 30

/**
 * Try fetching products from Laravel. Returns null if Laravel is unreachable.
 */
async function fetchFromLaravel(searchParams: URLSearchParams) {
  try {
    const laravelBase = getLaravelInternalUrl()
    const url = new URL(`${laravelBase}/public/products`)

    const perPage = searchParams.get('per_page') || searchParams.get('pageSize') || '50'
    url.searchParams.set('per_page', perPage)

    const search = searchParams.get('search') || searchParams.get('q')
    if (search) url.searchParams.set('search', search)

    const category = searchParams.get('category')
    if (category) url.searchParams.set('category', category)

    const res = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(3000), // 3s timeout — fast fallback to Prisma
    })

    if (!res.ok) return null

    const json = await res.json()
    const products = json?.data ?? []

    // Map to legacy response format expected by E2E tests
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = products.map((p: any) => {
      const categories = p.categories || []
      return {
        id: String(p.id),
        title: p.name || p.title,
        name: p.name || p.title,
        producer_id: p.producer_id || p.producer?.id || null,
        producerId: String(p.producer_id || p.producer?.id || ''),
        producerName: p.producer?.name ?? 'Παραγωγός',
        price: parseFloat(p.price),
        priceCents: Math.round(parseFloat(p.price) * 100),
        stock: typeof p.stock === 'number' ? p.stock : 0,
        imageUrl: p.image_url || p.images?.[0]?.url || '',
        category: toStorefrontSlug(categories[0]?.slug || p.category),
        slug: p.slug,
      }
    })

    return {
      items,
      total: items.length,
      page: 1,
      pageSize: items.length,
    }
  } catch {
    // Laravel unreachable (CI, dev without backend, network error)
    return null
  }
}

/**
 * Fallback: fetch from Prisma (used in CI with SQLite seed data)
 */
async function fetchFromPrisma(searchParams: URLSearchParams) {
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
    name: p.title,
    producer_id: p.producerId,
    producerId: p.producerId,
    producerName: p.producer?.name ?? 'Παραγωγός',
    price: p.price,
    priceCents: Math.round(p.price * 100),
    stock: p.stock ?? 0,
    imageUrl: p.imageUrl ?? '',
  }))

  return { items, total, page, pageSize }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    // Try Laravel first (production), fallback to Prisma (CI)
    const data = await fetchFromLaravel(searchParams)
      ?? await fetchFromPrisma(searchParams)

    const res = NextResponse.json(data)
    res.headers.set('Cache-Control', 'public, max-age=15, s-maxage=30, stale-while-revalidate=60')
    return res
  } catch (e) {
    console.error('[/api/products] Error:', e)
    return NextResponse.json({ items: [], total: 0, page: 1, pageSize: 20 }, { status: 200 })
  }
}
