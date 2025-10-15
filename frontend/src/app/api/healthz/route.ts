import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const basicAuth = process.env.BASIC_AUTH === '1';
  const devMailbox = process.env.SMTP_DEV_MAILBOX === '1';

  // Lightweight smoke check - no heavy DB operations
  return NextResponse.json({
    status: 'ok',
    basicAuth,
    devMailbox,
    ts: new Date().toISOString(),
  });
}
