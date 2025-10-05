import {NextResponse} from 'next/server';
import {prisma} from '@/lib/db/client';
import {ProducerUpdate} from '@/lib/validators/producer';

export async function GET(_: Request, {params}:{params:{id:string}}){
  const item = await prisma.producer.findUnique({where:{id: params.id}});
  if(!item) return NextResponse.json({error:'Not found'}, {status:404});
  return NextResponse.json(item);
}

export async function PATCH(req: Request, {params}:{params:{id:string}}){
  try {
    const body = await req.json().catch(():null=>null);
    const parsed = ProducerUpdate.safeParse(body);
    if(!parsed.success) return NextResponse.json({error:'Bad payload'}, {status:400});

    const updated = await prisma.producer.update({where:{id: params.id}, data: parsed.data});
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({error:'Failed to update producer'}, {status:500});
  }
}

export async function DELETE(_: Request, {params}:{params:{id:string}}){
  try {
    const updated = await prisma.producer.update({where:{id: params.id}, data: {isActive:false}});
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({error:'Failed to delete producer'}, {status:500});
  }
}
