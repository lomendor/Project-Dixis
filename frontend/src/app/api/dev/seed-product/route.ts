import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function POST(req: Request) {
  if (process.env.DIXIS_ENV === 'production') {
    return NextResponse.json({ error:'not found' }, { status:404 })
  }
  
  const body = await req.json().catch(()=> ({}))
  const data = {
    title: String(body.title || 'Δοκιμαστικό Προϊόν'),
    category: String(body.category || 'Δοκιμή'),
    price: Number(body.price ?? 5.0),
    unit: String(body.unit || 'τεμ'),
    stock: Number(body.stock ?? 10),
    isActive: true,
  }
  
  const item = await prisma.product.create({ data })
  return NextResponse.json({ ok:true, item }, { status:201 })
}
