import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
export async function POST(req: Request) {
  if (process.env.DIXIS_ENV === 'production') return NextResponse.json({ error:'not found' }, { status:404 })
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error:'missing id' }, { status:400 })
  const o = await prisma.order.findUnique({ where:{ id:String(id) }, select:{ publicToken:true }})
  return NextResponse.json({ ok: !!o, token: o?.publicToken||null })
}
