import { NextResponse } from 'next/server';
import { listMail } from '../../../../lib/devMailboxStore';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (process.env.SMTP_DEV_MAILBOX !== '1') {
    return new NextResponse('dev mailbox disabled', { status: 404 });
  }

  const url = new URL(req.url);
  const to = url.searchParams.get('to') || undefined;

  return NextResponse.json(listMail(to));
}
