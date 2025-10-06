import { NextResponse } from 'next/server';

export async function POST(){
  if (process.env.NODE_ENV === 'production' && process.env.DIXIS_DEV !== '1') {
    return new NextResponse('Not found', { status: 404 });
  }
  const { deliverQueued } = await import('@/lib/notify/deliver');
  const res = await deliverQueued(20);
  return NextResponse.json({ delivered: res });
}
