import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim() || ''
    const category = searchParams.get('category') || undefined
    const min = Number(searchParams.get('min')||'0')
    const max = Number(searchParams.get('max')||'0')
    const where:any = { isActive:true }
    if (q) where.title = { contains:q, mode:'insensitive' }
    if (category && category!=='all') where.category = category
    if (min || max) where.price = { gte: min||undefined, lte: max||undefined }
    const items = await prisma.product.findMany({
      where, orderBy:{ createdAt:'desc' },
      select:{ id:true,title:true,category:true,price:true,unit:true,stock:true,isActive:true }
    })
    return NextResponse.json({ ok:true, count:items.length, items }, { headers:{ 'cache-control':'no-store' }})
  } catch(e:any) { return NextResponse.json({ ok:false, error:e?.message||'error' }, { status:500 }) }
}
