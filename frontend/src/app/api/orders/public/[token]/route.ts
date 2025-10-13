import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

/** Επιτρέπουμε ΜΟΝΟ ασφαλή πεδία στο δημόσιο API */
function toPublic(order:any){
  if(!order) return null
  return {
    id: order.id,
    code: order.code || order.id,
    status: String(order.status||'').toUpperCase(),
    items: (order.items||[]).map((it:any)=>({
      title: it.title || it.productTitle || it.product?.title || '—',
      qty: Number(it.qty||it.quantity||0),
      price: Number(it.price||0)
    })),
    totals: {
      subtotal: Number(order.subtotal||0),
      shipping: Number(order.shippingCost||order.computedShipping||0),
      codFee: Number(order.codFee||0),
      tax: Number(order.tax||0),
      grandTotal: Number(order.total||0)
    },
    createdAt: order.createdAt || null,
  }
}

export async function GET(_: Request, ctx: { params: { token: string } }) {
  const token = String(ctx.params?.token||'').trim()
  if (!token) return NextResponse.json({ error:'missing token' }, { status:400 })

  const where:any = { publicToken: token }
  let order:any = null
  try {
    order = await prisma.order.findFirst({
      where,
      include:{ items:true }
    })
  } catch(e:any) {
    try {
      // @ts-expect-error - fallback for different column name
      order = await prisma.order.findFirst({ where: { public_token: token }, include:{ items:true } })
    } catch(_) {}
  }

  if (!order) return NextResponse.json({ error:'not found' }, { status:404 })
  return NextResponse.json({ ok:true, item: toPublic(order) })
}
