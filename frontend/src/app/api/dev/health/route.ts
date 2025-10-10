import { NextResponse } from 'next/server'
import { getRequestId } from '@/lib/observability/request'

export async function GET(req: Request) {
  if (process.env.DIXIS_ENV === 'production') return NextResponse.json({ error:'not found' }, { status:404 })
  const rid = getRequestId(req.headers)
  const res = NextResponse.json({ ok:true, env: process.env.DIXIS_ENV||'local', requestId: rid, time: new Date().toISOString() })
  res.headers.set('x-request-id', rid)
  return res
}
