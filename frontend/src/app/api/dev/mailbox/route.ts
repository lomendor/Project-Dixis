import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  if (String(process.env.SMTP_DEV_MAILBOX || '') !== '1') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const url = new URL(req.url);
  const to = url.searchParams.get('to') || '';
  const { list, latestFor } = await import('@/lib/mail/devMailbox');
  return to
    ? NextResponse.json({ item: await latestFor(to) })
    : NextResponse.json({ items: await list(20) });
}
