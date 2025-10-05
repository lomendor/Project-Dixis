import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function GET(_: Request, { params }:{ params:{ id:string }}){
  const item = await prisma.product.findUnique({ where:{ id: params.id }});
  if(!item || !item.isActive) return NextResponse.json({error:'Not found'},{status:404});
  return NextResponse.json(item);
}
