import {NextResponse} from 'next/server';
import {prisma} from '@/lib/db/client';

export async function GET(_: Request, {params}:{params:{id:string}}){
  const item = await prisma.producer.findUnique({where:{id: params.id}});
  if(!item) return NextResponse.json({error:'Not found'}, {status:404});
  return NextResponse.json(item);
}
