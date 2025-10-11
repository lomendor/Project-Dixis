import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET(_req: Request, ctx: { params: { token: string } }) {
  const token = String(ctx.params?.token||'').trim()
  if (!token) return NextResponse.json({ error:'missing token' }, { status:400 })
  // Read-only public projection (no PII)
  const o = await prisma.order.findFirst({
    where: { publicToken: token },
    select: {
      id: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      total: true
    }
  })
  if (!o) return NextResponse.json({ error:'not found' }, { status:404 })
  return NextResponse.json({ ok:true, order:o }, { status:200 })
}
