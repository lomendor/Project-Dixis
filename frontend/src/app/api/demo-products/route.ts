import { NextResponse } from 'next/server'
import path from 'node:path'
import { promises as fs } from 'node:fs'

export const revalidate = 60

async function readDemo(): Promise<any[]> {
  const roots = [process.cwd(), path.join(process.cwd(), 'frontend')]
  for (const root of roots) {
    const candidate = path.join(root, 'public', 'demo', 'products.json')
    try {
      const raw = await fs.readFile(candidate, 'utf8')
      return JSON.parse(raw)
    } catch {}
  }
  return []
}

export async function GET() {
  const data = await readDemo()
  const res = NextResponse.json({ items: data }, { status: 200 })
  res.headers.set('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120')
  return res
}
