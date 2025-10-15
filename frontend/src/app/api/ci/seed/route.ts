import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (process.env.BASIC_AUTH !== '1') {
    return new NextResponse('seed disabled', { status: 404 });
  }

  // Stub only: don't modify DB. Verify format and respond with 201.
  try {
    const { type, data } = await req.json();

    if (type !== 'user') {
      return new NextResponse('unsupported type', { status: 400 });
    }

    if (!data?.email) {
      return new NextResponse('email required', { status: 400 });
    }

    return NextResponse.json(
      { seeded: true, type, email: data.email },
      { status: 201 }
    );
  } catch {
    return new NextResponse('bad json', { status: 400 });
  }
}
