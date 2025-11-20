import { NextResponse } from 'next/server'
import path from 'node:path'
import { promises as fs } from 'node:fs'

export const revalidate = 30

async function fromDemo() {
  try {
    const file = path.join(process.cwd(), 'public', 'demo', 'products.json')
    const raw = await fs.readFile(file, 'utf8')
    const data = JSON.parse(raw)
    return { source: 'demo', items: data }
  } catch {
    return { source: 'demo', items: [] }
  }
}

async function fromDb() {
  const url = process.env.DATABASE_URL
  if (!url) return { source: 'db', items: [] }
  // lazy import για να μη βαραίνει το edge
  const { Client } = await import('pg')
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
  await client.connect()
  try {
    // Πίνακας-safe για demo, δεν ακουμπά υπάρχον schema
    await client.query(`
      CREATE TABLE IF NOT EXISTS catalog_demo_products (
        id text primary key,
        title text not null,
        price_cents int not null,
        producer text,
        image text
      )
    `)
    const res = await client.query('SELECT id, title, price_cents AS "priceCents", producer, image FROM catalog_demo_products ORDER BY title LIMIT 60;')
    return { source: 'db', items: res.rows }
  } finally {
    await client.end()
  }
}

export async function GET() {
  const mode = (process.env.PRODUCTS_MODE || 'demo').toLowerCase()
  const data = mode === 'db' ? await fromDb() : await fromDemo()
  const body = { source: data.source, count: data.items.length, items: data.items }
  const res = NextResponse.json(body, { status: 200 })
  res.headers.set('Cache-Control', 'public, max-age=15, s-maxage=30, stale-while-revalidate=60')
  return res
}
