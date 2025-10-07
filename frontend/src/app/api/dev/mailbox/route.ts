import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  if (String(process.env.SMTP_DEV_MAILBOX || '') !== '1') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const url = new URL(req.url);
  const to = url.searchParams.get('to') || '';
  const { list, latestFor } = await import('@/lib/mail/devMailbox');

  if (to) {
    const one = await latestFor(to);
    return NextResponse.json({ item: one });
  } else {
    const items = await list(20);
    return NextResponse.json({ items });
  }
}
