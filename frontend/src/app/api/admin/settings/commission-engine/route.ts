import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Pass COMM-ENGINE-TOGGLE-01: Proxy to Laravel admin commission-engine toggle.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001/api/v1';

async function getToken(req: NextRequest) {
  const cookieStore = await cookies();
  return cookieStore.get('auth_token')?.value || req.headers.get('authorization')?.replace('Bearer ', '');
}

export async function GET(req: NextRequest) {
  const token = await getToken(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await fetch(`${API_BASE}/admin/settings/commission-engine`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const token = await getToken(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const res = await fetch(`${API_BASE}/admin/settings/commission-engine`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
