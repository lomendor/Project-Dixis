import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { cookies } from 'next/headers';

export async function GET(){
  const cookieStore = await cookies();
  const c = cookieStore.get('dixis_session')?.value;
  if(!c) return NextResponse.json({ authenticated:false });
  const s = await prisma.session.findUnique({ where:{ id: c }});
  if(!s || s.expiresAt < new Date()) return NextResponse.json({ authenticated:false });
  return NextResponse.json({ authenticated:true, phone: s.phone, role: s.role });
}
