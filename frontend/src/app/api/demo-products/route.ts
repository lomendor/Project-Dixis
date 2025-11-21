import { NextResponse } from 'next/server'
import path from 'node:path'
import { promises as fs } from 'node:fs'

export const revalidate = 60

export async function GET() {
  try {
    const file = path.join(process.cwd(), 'public', 'demo', 'products.json')
    const raw = await fs.readFile(file, 'utf8')
    const data = JSON.parse(raw)
    const res = NextResponse.json({ items: data }, { status: 200 })
    res.headers.set('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120')
    return res
  } catch {
    return NextResponse.json({ items: [] }, { status: 200 })
  }
}
