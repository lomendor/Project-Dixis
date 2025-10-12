import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export async function GET() {
  if (process.env.DIXIS_ENV === 'production') return NextResponse.json({ error:'not found' }, { status:404 })
  const rows = await prisma.$queryRawUnsafe(`SELECT publicToken, COUNT(*) c FROM "Order" GROUP BY publicToken HAVING COUNT(*)>1`)
  return NextResponse.json({ duplicates: Array.isArray(rows) ? rows.length : 0 })
}
