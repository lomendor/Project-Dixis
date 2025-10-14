import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'
export async function GET(req: Request) {
  try{
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim() || ''
    const where:any = { isActive:true }
    if (q) where.title = { contains:q, mode:'insensitive' }
    const items = await prisma.product.findMany({
      where, orderBy:{ createdAt:'desc' },
      select:{ id:true,title:true,category:true,price:true,unit:true,stock:true,isActive:true }
    })
    // Transform to match Laravel API format expected by HomeClient
    const transformed = items.map(p => ({
      ...p,
      name: p.title,
      images: [],  // Stub empty array - HomeClient will use placeholder
      producer: { name: 'Demo Producer' },  // Stub producer
      categories: []  // Stub categories
    }))
    return NextResponse.json({ ok:true, count: items.length, data: transformed }, { headers:{ 'cache-control':'no-store' }})
  }catch(e:any){
    return NextResponse.json({ ok:false, error: e?.message||'error' }, { status:500 })
  }
}
