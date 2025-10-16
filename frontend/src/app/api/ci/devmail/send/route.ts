import { NextResponse } from 'next/server';
import { pushMail } from '../../../../../lib/devMailboxStore';
import { rateLimit } from '../../../../../lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (process.env.SMTP_DEV_MAILBOX !== '1') {
    return new NextResponse('dev mailbox disabled', { status: 404 });
  }

  // Rate-limit: 30 req/min (prod-only)
  if (!(await rateLimit('devmail-send', 30))) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  try {
    const { to, subject, body } = await req.json();

    if (!to || !subject) {
      return new NextResponse('to/subject required', { status: 400 });
    }

    pushMail({ to, subject, body });

    return new NextResponse(null, { status: 202 });
  } catch {
    return new NextResponse('bad json', { status: 400 });
  }
}
