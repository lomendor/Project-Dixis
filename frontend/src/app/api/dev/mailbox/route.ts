import { NextResponse } from 'next/server'
import { list, first } from '@/lib/dev/mailbox'

export async function GET(req: Request){
  if (process.env.DIXIS_ENV === 'production') return NextResponse.json({ error:'not found' }, { status:404 })
  const url = new URL(req.url)
  const to = url.searchParams.get('to') || undefined
  const payload = to ? { item: first(to) } : { items: list() }
  return NextResponse.json(payload, { status:200 })
}
