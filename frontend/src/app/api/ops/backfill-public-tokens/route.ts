import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ops = process.env.OPS_ADMIN_TOKEN;
  if (!ops || req.headers.get('x-ops-token') !== ops) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // Since publicToken has @default(uuid()), all orders created after schema update
  // automatically get a token. This endpoint is a no-op for safety.
  // If old orders exist from before the field was added, they would need
  // a database migration to add tokens, not this endpoint.

  return NextResponse.json({
    ok: true,
    updated: 0,
    message: 'publicToken has @default(uuid()) - all new orders get tokens automatically'
  });
}
