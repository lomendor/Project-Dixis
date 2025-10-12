import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET(req: Request) {
  if (process.env.DIXIS_ENV === 'production') return NextResponse.json({ error:'not found' }, { status:404 })
  const url = new URL(req.url)
  const id = url.searchParams.get('id')||''
  if(!id) return NextResponse.json({ error:'missing id' }, { status:400 })
  const o = await prisma.order.findUnique({ where:{ id: String(id) }, select:{ publicToken:true, id:true } })
  if(!o) return NextResponse.json({ error:'not found' }, { status:404 })
  return NextResponse.json({ ok:true, id:o.id, token:o.publicToken })
}
