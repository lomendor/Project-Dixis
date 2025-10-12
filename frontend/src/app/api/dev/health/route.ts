import { NextResponse } from 'next/server'
import { getRequestId, logWithId } from '@/lib/observability/request'

export const dynamic = 'force-dynamic' // health shouldn't be cached

export async function GET(req: Request) {
  // Dev-only: hide in production
  if ((process.env.DIXIS_ENV||'local') === 'production') {
    return NextResponse.json({ error:'not found' }, { status:404 })
  }
  const rid = getRequestId(req.headers)
  let db:'ok'|'fail'|'na' = 'na'
  try {
    // Optional DB ping (works in SQLite/Postgres)
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    await prisma.$queryRaw`SELECT 1`
    db = 'ok'
  } catch (e:any) {
    db = 'fail'
  }

  const payload = { ok:true, env: process.env.DIXIS_ENV||'local', requestId: rid, db }
  const res = NextResponse.json(payload, { status:200 })
  res.headers.set('x-request-id', rid)
  logWithId(rid, 'health', payload)
  return res
}
