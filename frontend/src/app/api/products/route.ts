import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export const revalidate = 30

interface Product {
  id: number
  title: string
  price_cents: number | null
  image_url: string | null
  producer_name: string | null
}

async function fetchFromDB(): Promise<{ source: 'db'; items: any[] } | null> {
  const useDB = process.env.USE_DB_PRODUCTS === '1'
  const dbUrl = process.env.DATABASE_URL

  if (!useDB || !dbUrl) {
    console.log('[/api/products] DB disabled or DATABASE_URL missing')
    return null
  }

  try {
    const sql = neon(dbUrl)
    const rows = await sql`
      SELECT id, title, price_cents, image_url, producer_name
      FROM products
      ORDER BY id
      LIMIT 50
    ` as Product[]

    if (!rows || rows.length === 0) {
      console.log('[/api/products] DB returned 0 products, falling back')
      return null
    }

    const items = rows.map((p) => ({
      id: p.id,
      title: p.title || 'Προϊόν',
      priceCents: p.price_cents ?? 0,
      image: p.image_url || '/demo/placeholder.jpg',
      producer: p.producer_name || 'Παραγωγός',
    }))

    console.log(`[/api/products] DB returned ${items.length} products`)
    return { source: 'db', items }
  } catch (err) {
    console.error('[/api/products] DB query failed:', err)
    return null
  }
}

async function fetchFromDemoFeed(): Promise<{ source: 'demo'; items: any[] }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'
    const res = await fetch(`${baseUrl}/api/demo-products`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`Demo feed returned ${res.status}`)
    const data = await res.json()
    console.log('[/api/products] Using demo feed fallback')
    return { source: 'demo', items: data.items || [] }
  } catch (err) {
    console.error('[/api/products] Demo feed failed:', err)
    return { source: 'demo', items: [] }
  }
}

export async function GET() {
  // Try DB first
  const dbResult = await fetchFromDB()
  if (dbResult) {
    const res = NextResponse.json(dbResult, { status: 200 })
    res.headers.set('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120')
    return res
  }

  // Fallback to demo feed
  const demoResult = await fetchFromDemoFeed()
  const res = NextResponse.json(demoResult, { status: 200 })
  res.headers.set('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120')
  return res
}
