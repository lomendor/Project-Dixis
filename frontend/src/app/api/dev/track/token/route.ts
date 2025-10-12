import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export async function GET(req: Request){
  if (process.env.DIXIS_ENV === 'production') return NextResponse.json({ error:'not found' }, { status:404 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('orderId')
  if (!id) return NextResponse.json({ error:'missing orderId' }, { status:400 })
  const o = await prisma.order.findUnique({ where:{ id }, select:{ publicToken:true } })
  if (!o?.publicToken) return NextResponse.json({ error:'no token' }, { status:404 })
  return NextResponse.json({ token: o.publicToken })
}
