import { NextResponse } from 'next/server'

const FLAG_ON = (process.env.PRODUCTS_DB_V1 || '').toLowerCase() === 'on'

// lazy import για να μη "σκάει" build/CI αν δεν υπάρχει ακόμη η table
async function dbList() {
  const { prisma } = await import('@/src/lib/prisma')
  // Αν η table δεν υπάρχει ακόμα (πριν migration) γυρνάμε απλώς κενό
  try {
    const rows = await prisma.product.findMany({
      select: { id: true, title: true, price_cents: true, image: true, producer_name: true, created_at: true },
      orderBy: { created_at: 'desc' },
      take: 40,
    })
    return rows.map(r => ({
      id: r.id,
      title: r.title,
      price: r.price_cents != null ? (r.price_cents/100).toLocaleString('el-GR',{style:'currency',currency:'EUR'}) : '—',
      image: r.image || null,
      producer: r.producer_name || null,
    }))
  } catch (_e) {
    return []
  }
}

export const revalidate = 30

export async function GET() {
  let items: any[] = []
  if (FLAG_ON) {
    items = await dbList()
  } else {
    // Fallback σε demo εάν υπάρχει, αλλιώς κενό
    try {
      const res = await fetch(new URL('/api/demo-products', 'http://localhost'), { cache: 'no-store' })
      if (res.ok) {
        const j = await res.json()
        items = Array.isArray(j.items) ? j.items : []
      }
    } catch {}
  }

  const res = NextResponse.json({ items }, { status: 200 })
  res.headers.set('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120')
  return res
}
