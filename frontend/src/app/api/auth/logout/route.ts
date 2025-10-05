import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { cookies } from 'next/headers';

export async function POST(){
  const cookieStore = await cookies();
  const c = cookieStore.get('dixis_session')?.value;
  if(c){ try{ await prisma.session.delete({ where:{ id: c }}) }catch{} }
  const res = NextResponse.json({ ok:true });
  res.cookies.set('dixis_session','', { httpOnly:true, path:'/', maxAge:0 });
  return res;
}
