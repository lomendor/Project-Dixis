import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export async function GET(_req: Request, { params }:{ params:{ token:string } }){
  try{
    const token = params.token
    if (!token) return NextResponse.json({ error:'missing token' }, { status:400 })
    // ΠΕΔΙΑ ΕΛΑΧΙΣΤΑ — read-only
    const o = await prisma.order.findFirst({
      where:{ publicToken: token },
      select:{ id:true, status:true, createdAt:true, updatedAt:true, buyerName:true, total:true }
    })
    if (!o) return NextResponse.json({ error:'not found' }, { status:404 })
    return NextResponse.json({
      id: o.id,
      status: o.status,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      buyerName: o.buyerName,
      total: o.total
    })
  }catch(e:any){
    return NextResponse.json({ error: e?.message || 'fail' }, { status:500 })
  }
}
